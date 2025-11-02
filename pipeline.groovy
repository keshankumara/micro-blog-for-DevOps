// pipeline.groovy - Fixed scripted Jenkins pipeline (HTTPS clone + optional SSH deploy)
// - Clones via HTTPS (public repo) to avoid SSH host-key/credential issues.
// - DEPLOY_VIA_SSH controls whether to deploy to remote host via SSH (requires SSH Agent plugin + 'deploy-ssh' credential)
//   or run docker compose locally on the Jenkins agent.
// - Does NOT use ansiColor to avoid Declarative/option parsing issues.

properties([
  parameters([
    string(name: 'BRANCH',         defaultValue: 'main', description: 'Git branch to deploy'),
    booleanParam(name: 'DEPLOY_VIA_SSH', defaultValue: false, description: 'If true deploys to remote host via SSH; otherwise deploys locally on the Jenkins agent'),
    string(name: 'DEPLOY_HOST',    defaultValue: 'your.remote.host', description: 'Remote host (IP/hostname) to SSH into (if DEPLOY_VIA_SSH=true)'),
    string(name: 'DEPLOY_USER',    defaultValue: 'ubuntu', description: 'User on remote host (if DEPLOY_VIA_SSH=true)'),
    string(name: 'REMOTE_APP_DIR', defaultValue: '/home/ubuntu/micro-blog', description: 'Directory on remote host where repo will live'),
    booleanParam(name: 'CLEAN_FIRST', defaultValue: false, description: 'Remove remote dir before clone (use with caution)'),
    booleanParam(name: 'USE_SUDO',  defaultValue: false, description: 'If remote requires sudo for docker commands (DEPLOY_VIA_SSH=true)'),
    booleanParam(name: 'FORCE_LOCAL_BUILD', defaultValue: false, description: 'If true and DEPLOY_VIA_SSH=true, will still build images locally and rsync to remote (not implemented by default)')
  ])
])

node {
  // Configuration
  def REPO_HTTP = 'https://github.com/keshankumara/micro-blog-for-DevOps.git'
  def DOCKER_COMPOSE_FILE = 'docker-compose.yml'
  def BACKEND_HEALTH = 'http://127.0.0.1:5000/api/posts'
  def MAX_HEALTH_RETRIES = 18
  def HEALTH_SLEEP = 5
  def DEPLOY_SSH_CRED = 'deploy-ssh' // SSH private key credential id in Jenkins (only used if DEPLOY_VIA_SSH=true)

  try {
    stage('Checkout (HTTPS)') {
      echo "Cloning ${REPO_HTTP} (branch: ${params.BRANCH}) via HTTPS"
      deleteDir()
      // HTTPS clone avoids SSH host-key/credential issues for public repos
      checkout([$class: 'GitSCM',
        branches: [[name: "*/${params.BRANCH}"]],
        userRemoteConfigs: [[url: REPO_HTTP]]
      ])
      sh 'echo "Workspace:"; ls -la'
    }

    if (params.DEPLOY_VIA_SSH.toBoolean()) {
      stage('Deploy -> remote via SSH') {
        echo "Deploying to ${params.DEPLOY_USER}@${params.DEPLOY_HOST} -> ${params.REMOTE_APP_DIR}"

        // Ensure sshagent is available in your Jenkins (SSH Agent plugin). If it's not installed you'll get an error.
        sshagent([DEPLOY_SSH_CRED]) {
          // Prepare remote directory (optionally clean)
          if (params.CLEAN_FIRST.toBoolean()) {
            sh """
              ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
                'rm -rf ${params.REMOTE_APP_DIR} && mkdir -p ${params.REMOTE_APP_DIR}'
            """
          } else {
            sh """
              ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
                'mkdir -p ${params.REMOTE_APP_DIR}'
            """
          }

          // Clone on remote or reset to the branch
          sh """
            ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
            'set -e
             cd ${params.REMOTE_APP_DIR}
             if [ -d .git ]; then
               echo "Repo exists - fetching & resetting to ${params.BRANCH}"
               git fetch --all --prune
               git checkout ${params.BRANCH} || git checkout -b ${params.BRANCH}
               git reset --hard origin/${params.BRANCH}
             else
               echo "Cloning repo ${REPO_HTTP} branch ${params.BRANCH}"
               git clone --branch ${params.BRANCH} ${REPO_HTTP} .
             fi'
          """
          // Run docker compose on remote (with optional sudo)
          def sudoPref = params.USE_SUDO.toBoolean() ? 'sudo ' : ''
          sh """
            ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
            'set -e
             cd ${params.REMOTE_APP_DIR}
             if ! command -v docker >/dev/null 2>&1; then
               echo "docker not found on remote - aborting" >&2
               exit 2
             fi
             if ${sudoPref}docker compose version >/dev/null 2>&1; then
               ${sudoPref}docker compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
               ${sudoPref}docker compose -f ${DOCKER_COMPOSE_FILE} up -d --build
             else
               ${sudoPref}docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
               ${sudoPref}docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --build
             fi
            '
          """
        } // end sshagent
      }

      stage('Wait for backend (remote)') {
        echo "Polling backend on remote host ${params.DEPLOY_HOST}..."
        sshagent([DEPLOY_SSH_CRED]) {
          def ok = false
          for (int i = 1; i <= MAX_HEALTH_RETRIES; i++) {
            try {
              sh """
                ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
                'curl --fail --silent --show-error --max-time 5 ${BACKEND_HEALTH} >/dev/null 2>&1'
              """
              echo "Backend healthy (attempt ${i})"
              ok = true
              break
            } catch (err) {
              echo "Attempt ${i}/${MAX_HEALTH_RETRIES} - backend not ready. Sleeping ${HEALTH_SLEEP}s..."
              sleep HEALTH_SLEEP
            }
          }
          if (!ok) {
            error "Backend did not become healthy after ${MAX_HEALTH_RETRIES * HEALTH_SLEEP} seconds (remote)."
          }
        }
      }

      stage('Post-deploy logs (remote)') {
        sshagent([DEPLOY_SSH_CRED]) {
          def sudoPref = params.USE_SUDO.toBoolean() ? 'sudo ' : ''
          sh """
            ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
            'if ${sudoPref}docker compose version >/dev/null 2>&1; then
               ${sudoPref}docker compose -f ${DOCKER_COMPOSE_FILE} ps || true
               ${sudoPref}docker compose -f ${DOCKER_COMPOSE_FILE} logs --tail=200 || true
             else
               ${sudoPref}docker-compose -f ${DOCKER_COMPOSE_FILE} ps || true
               ${sudoPref}docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=200 || true
             fi'
          """
        }
      }
    } else {
      // Local deployment on Jenkins agent
      stage('Deploy -> locally on Jenkins agent') {
        echo "Running docker compose locally on Jenkins agent (must have Docker and docker compose installed)."
        sh '''
          if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
            docker compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
            docker compose -f ${DOCKER_COMPOSE_FILE} up -d --build
          else
            docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
            docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --build
          fi
        '''
      }

      stage('Wait for backend (local)') {
        echo "Polling backend locally..."
        def ok = false
        for (int i = 1; i <= MAX_HEALTH_RETRIES; i++) {
          try {
            sh "curl --fail --silent --show-error --max-time 5 ${BACKEND_HEALTH} >/dev/null 2>&1"
            echo "Backend healthy (attempt ${i})"
            ok = true
            break
          } catch (err) {
            echo "Attempt ${i}/${MAX_HEALTH_RETRIES} - backend not ready. Sleeping ${HEALTH_SLEEP}s..."
            sleep HEALTH_SLEEP
          }
        }
        if (!ok) {
          error "Backend did not become healthy after ${MAX_HEALTH_RETRIES * HEALTH_SLEEP} seconds (local)."
        }
      }

      stage('Post-deploy logs (local)') {
        sh '''
          if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
            docker compose -f ${DOCKER_COMPOSE_FILE} ps || true
            docker compose -f ${DOCKER_COMPOSE_FILE} logs --tail=200 || true
          else
            docker-compose -f ${DOCKER_COMPOSE_FILE} ps || true
            docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=200 || true
          fi
        '''
      }
    } // end deploy mode

    stage('Success') {
      echo "Deployment completed successfully."
    }

  } catch (err) {
    echo "Deployment failed: ${err}"
    // Try to collect helpful logs (remote if DEPLOY_VIA_SSH true)
    if (params.DEPLOY_VIA_SSH.toBoolean()) {
      try {
        sshagent([DEPLOY_SSH_CRED]) {
          def sudoPref = params.USE_SUDO.toBoolean() ? 'sudo ' : ''
          sh """
            ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
            'echo \"-- docker ps --\"; ${sudoPref}docker ps --format \"{{.Names}} {{.Image}} {{.Status}}\" || true; \\
             echo \"-- compose ps --\"; if ${sudoPref}docker compose version >/dev/null 2>&1; then ${sudoPref}docker compose ps || true; else ${sudoPref}docker-compose ps || true; fi; \\
             echo \"-- last logs (400) --\"; if ${sudoPref}docker compose version >/dev/null 2>&1; then ${sudoPref}docker compose logs --tail=400 || true; else ${sudoPref}docker-compose logs --tail=400 || true; fi'
          """
        }
      } catch (ignored) {
        echo "Failed to collect remote logs: ${ignored}"
      }
    } else {
      // collect local logs
      sh '''
        if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
          docker compose -f ${DOCKER_COMPOSE_FILE} ps || true
          docker compose -f ${DOCKER_COMPOSE_FILE} logs --tail=400 || true
        else
          docker-compose -f ${DOCKER_COMPOSE_FILE} ps || true
          docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=400 || true
        fi
      '''
    }
    throw err
  } finally {
    echo "Pipeline finished."
  }
}

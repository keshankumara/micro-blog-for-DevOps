// pipeline.groovy - Scripted Jenkins pipeline for SSH deploy of micro-blog-for-DevOps
// Place in repo or paste into a Pipeline job. Uses ssh-agent plugin for remote SSH keys.

properties([
  parameters([
    string(name: 'BRANCH',        defaultValue: 'main', description: 'Git branch to deploy'),
    string(name: 'DEPLOY_HOST',   defaultValue: 'your.remote.host', description: 'Remote host (IP/hostname)'),
    string(name: 'DEPLOY_USER',   defaultValue: 'ubuntu', description: 'User on remote host'),
    string(name: 'REMOTE_APP_DIR',defaultValue: '/home/ubuntu/micro-blog', description: 'Remote dir for the app'),
    booleanParam(name: 'CLEAN_FIRST', defaultValue: false, description: 'Remove remote dir before clone (use with caution)'),
    booleanParam(name: 'USE_SUDO', defaultValue: false, description: 'Prefix remote docker commands with sudo if required')
  ])
])

node {
  // config
  def GIT_SSH = 'github-ssh'    // Jenkins credential id (SSH key) for GitHub
  def DEPLOY_SSH = 'deploy-ssh' // Jenkins credential id (SSH key) for remote host
  def REPO_SSH = 'git@github.com:keshankumara/micro-blog-for-DevOps.git'
  def DOCKER_COMPOSE_FILE = 'docker-compose.yml'
  def BACKEND_HEALTH = 'http://127.0.0.1:5000/api/posts'
  def MAX_HEALTH_RETRIES = 18
  def HEALTH_SLEEP = 5

  stage('Prepare workspace & checkout') {
    echo "Preparing workspace and checking out ${params.BRANCH} from ${REPO_SSH}"
    deleteDir()
    // Checkout using SSH credential (works for private repos)
    checkout([$class: 'GitSCM',
      branches: [[name: "*/${params.BRANCH}"]],
      userRemoteConfigs: [[url: REPO_SSH, credentialsId: GIT_SSH]]
    ])
    sh 'echo "Workspace ready"; ls -la'
  }

  try {
    stage('Deploy: ensure remote dir & fetch code') {
      sshagent([DEPLOY_SSH]) {
        // ensure remote dir exists (optionally clean it)
        if (params.CLEAN_FIRST) {
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

        // Clone if missing, else fetch & reset to remote branch
        sh """
          ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
          'set -e
           cd ${params.REMOTE_APP_DIR}
           if [ -d .git ]; then
             echo "Repo exists - fetching and resetting to ${params.BRANCH}"
             git fetch --all --prune
             git checkout ${params.BRANCH} || git checkout -b ${params.BRANCH}
             git reset --hard origin/${params.BRANCH}
           else
             echo "Cloning ${REPO_SSH} branch ${params.BRANCH}"
             git clone --branch ${params.BRANCH} ${REPO_SSH} .
           fi'
        """
      }
    }

    stage('Deploy: docker compose up') {
      sshagent([DEPLOY_SSH]) {
        // Build command to optionally prefix sudo
        def sudoPrefix = params.USE_SUDO ? 'sudo ' : ''
        sh """
          ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
          'set -e
           cd ${params.REMOTE_APP_DIR}
           if ! command -v docker >/dev/null 2>&1; then
             echo "docker not found on remote - aborting" >&2
             exit 2
           fi
           if ${sudoPrefix}docker compose version >/dev/null 2>&1; then
             ${sudoPrefix}docker compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
             ${sudoPrefix}docker compose -f ${DOCKER_COMPOSE_FILE} up -d --build
           else
             ${sudoPrefix}docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
             ${sudoPrefix}docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --build
           fi
          '
        """
      }
    }

    stage('Wait for backend health') {
      sshagent([DEPLOY_SSH]) {
        echo "Polling backend health at ${BACKEND_HEALTH} on remote host..."
        def ok = false
        for (int i = 1; i <= MAX_HEALTH_RETRIES; i++) {
          try {
            sh """
              ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
              'curl --fail --silent --show-error --max-time 5 ${BACKEND_HEALTH} >/dev/null 2>&1'
            """
            echo "Backend healthy (attempt ${i})."
            ok = true
            break
          } catch (err) {
            echo "Attempt ${i}/${MAX_HEALTH_RETRIES} - backend not ready. Sleeping ${HEALTH_SLEEP}s..."
            sleep HEALTH_SLEEP
          }
        }
        if (!ok) {
          error "Backend did not become healthy after ${MAX_HEALTH_RETRIES * HEALTH_SLEEP} seconds."
        }
      }
    }

    stage('Post-deploy: gather status & logs') {
      sshagent([DEPLOY_SSH]) {
        def sudoPrefix = params.USE_SUDO ? 'sudo ' : ''
        sh """
          ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
          'if ${sudoPrefix}docker compose version >/dev/null 2>&1; then
             ${sudoPrefix}docker compose -f ${DOCKER_COMPOSE_FILE} ps || true
             ${sudoPrefix}docker compose -f ${DOCKER_COMPOSE_FILE} logs --tail=200 || true
           else
             ${sudoPrefix}docker-compose -f ${DOCKER_COMPOSE_FILE} ps || true
             ${sudoPrefix}docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=200 || true
           fi'
        """
      }
    }

    stage('Done') {
      echo "Deployment finished successfully."
    }

  } catch (err) {
    stage('Failure handling') {
      echo "Deployment failed: ${err}"
      // try to collect larger logs & ps for debugging
      sshagent([DEPLOY_SSH]) {
        def sudoPrefix = params.USE_SUDO ? 'sudo ' : ''
        sh """
          ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \\
          'echo \"-- docker ps --\"; ${sudoPrefix}docker ps --format \"{{.Names}} {{.Image}} {{.Status}}\" || true; \\
           echo \"-- compose ps --\"; if ${sudoPrefix}docker compose version >/dev/null 2>&1; then ${sudoPrefix}docker compose ps || true; else ${sudoPrefix}docker-compose ps || true; fi; \\
           echo \"-- last logs (400) --\"; if ${sudoPrefix}docker compose version >/dev/null 2>&1; then ${sudoPrefix}docker compose logs --tail=400 || true; else ${sudoPrefix}docker-compose logs --tail=400 || true; fi'
        """
      }
    }
    // rethrow to mark build failed
    throw err
  } finally {
    echo "Pipeline finished."
  }
}

// Jenkinsfile - Declarative pipeline for building + deploying docker-compose stack
pipeline {
  agent any

  // Optional: allow selecting branch at build time
  parameters {
    string(name: 'BRANCH', defaultValue: 'main', description: 'Git branch to build')
    booleanParam(name: 'PUSH_IMAGES', defaultValue: false, description: 'Push images to Docker Hub (requires credentials)')
  }

  environment {
    COMPOSE_PROJECT_NAME = "micro-blog"
    DOCKER_COMPOSE_FILE = "docker-compose.yml"
    BACKEND_HEALTH_URL = "http://127.0.0.1:5000/api/posts"
    // If pushing, configure a Jenkins credential with ID 'dockerhub-creds' (username/password)
    DOCKERHUB_CREDENTIALS = 'dockerhub-creds'
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timestamps()
  }

  stages {
    stage('Prepare') {
      steps {
        echo "Building branch: ${params.BRANCH}"
        // Checkout the branch (assumes Jenkins multibranch or pipeline with Git configured)
        checkout([$class: 'GitSCM',
                  branches: [[name: "*/${params.BRANCH}"]],
                  userRemoteConfigs: [[url: env.GIT_URL ?: scm.userRemoteConfigs[0].url]]])
        sh 'docker --version || true'
        sh 'docker-compose --version || true'
      }
    }

    stage('Build images') {
      steps {
        echo "Building docker-compose images..."
        // Build images defined in docker-compose.yml
        sh "docker-compose -f ${DOCKER_COMPOSE_FILE} build --parallel"
      }
    }

    // Optional: push images to Docker Hub (disabled by default)
    stage('Push images (optional)') {
      when {
        expression { return params.PUSH_IMAGES == true }
      }
      steps {
        echo "Pushing images to Docker registry..."
        withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh """
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            # tag & push if you want; adjust names/tags to match your images/repo
            docker tag frontend:latest ${DOCKER_USER}/frontend:latest
            docker tag backend:latest ${DOCKER_USER}/backend:latest
            docker push ${DOCKER_USER}/frontend:latest
            docker push ${DOCKER_USER}/backend:latest
            docker logout
          """
        }
      }
    }

    stage('Deploy (docker-compose up)') {
      steps {
        echo "Bringing up stack..."
        // Stop any running stack first (safe)
        sh "docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true"
        sh "docker-compose -f ${DOCKER_COMPOSE_FILE} up -d"
      }
    }

    stage('Wait for backend health') {
      steps {
        echo "Waiting for backend to return HTTP 200 at ${env.BACKEND_HEALTH_URL} ..."
        // simple poll loop that waits up to 90 seconds (adjust as needed)
        script {
          def maxRetries = 18
          def sleepSec = 5
          def ok = false
          for (int i = 1; i <= maxRetries; i++) {
            try {
              sh "curl --fail --silent --show-error --max-time 3 ${env.BACKEND_HEALTH_URL} >/dev/null 2>&1"
              echo "Backend healthy (HTTP 200)."
              ok = true
              break
            } catch (err) {
              echo "Attempt ${i}/${maxRetries} - backend not ready yet. Sleeping ${sleepSec}s..."
              sleep time: sleepSec, unit: 'SECONDS'
            }
          }
          if (!ok) {
            error "Backend did not become healthy within ${maxRetries * sleepSec} seconds."
          }
        }
      }
    }

    stage('Post-deploy checks') {
      steps {
        sh "docker-compose -f ${DOCKER_COMPOSE_FILE} ps"
        echo "Last logs (backend/frontend):"
        sh "docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=80"
      }
    }
  }

  post {
    success {
      echo "Deployment SUCCESS: Stack is up and healthy."
    }
    failure {
      echo "Deployment FAILED - collecting logs and tearing down."
      sh "docker-compose -f ${DOCKER_COMPOSE_FILE} ps || true"
      sh "docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=200 || true"
      // optionally bring stack down to avoid partial broken state
      sh "docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true"
    }
    cleanup {
      echo "Pipeline finished."
    }
  }
}

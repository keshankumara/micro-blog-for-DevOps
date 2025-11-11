pipeline {
  agent any

  parameters {
    string(name: 'DOCKERHUB_NAMESPACE', defaultValue: 'keshan001', description: 'Docker Hub namespace')
    string(name: 'IMAGE_TAG', defaultValue: '', description: 'Image tag (defaults to branch-BUILD_NUMBER)')
    string(name: 'GIT_BRANCH', defaultValue: 'main', description: 'Branch to build')
  }

  environment {
    DOCKERHUB_CRED = 'dockerhub'   // Jenkins credential ID for Docker Hub (username/password)
    GIT_CRED = 'github-creds'      // Jenkins credential ID for Git (optional)
  }

  stages {
    stage('Checkout') {
      steps {
        // Replace URL and credentialsId with your values
        git branch: "${params.GIT_BRANCH}",
            url: 'https://github.com/youruser/yourrepo.git',
            credentialsId: env.GIT_CRED
      }
    }

    stage('Prepare tag') {
      steps {
        script {
          def branch = "${params.GIT_BRANCH}"
          def defaultTag = "${branch}-${env.BUILD_NUMBER}"
          env.IMAGE_TAG_RESOLVED = params.IMAGE_TAG?.trim() ? params.IMAGE_TAG : defaultTag
          echo "Using image tag: ${env.IMAGE_TAG_RESOLVED}"
        }
      }
    }

    stage('Build and push images') {
      steps {
        script {
          if (env.DOCKERHUB_CRED) {
            withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CRED, usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
              sh 'echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin'

              def backendImage = "${params.DOCKERHUB_NAMESPACE}/microblog-backend:${env.IMAGE_TAG_RESOLVED}"
              sh "docker build -t ${backendImage} ./backend"
              sh "docker push ${backendImage}"

              def frontendImage = "${params.DOCKERHUB_NAMESPACE}/microblog-frontend:${env.IMAGE_TAG_RESOLVED}"
              sh "docker build -t ${frontendImage} ./frontend"
              sh "docker push ${frontendImage}"

              sh 'docker logout'
            }
          } else {
            error "No Docker Hub credentials provided."
          }
        }
      }
    }
  }

  post {
    success { echo "Pipeline finished successfully. Images pushed with tag ${env.IMAGE_TAG_RESOLVED}." }
    failure { echo "Pipeline failed. Check logs." }
  }
}

pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "kvcn/frontend-app"
        BACKEND_IMAGE = "kvcn/backend-app"
        GIT_REPO = "https://github.com/nilumindakvc/ASPCIdentity.git"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${FRONTEND_IMAGE}:latest -f frontend/userlogin/Dockerfile frontend/userlogin"
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    sh "docker build -t ${BACKEND_IMAGE}:latest -f Identity/Dockerfile Identity"
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }
    }

    post {
        always {
            sh "docker logout"
        }
    }
}

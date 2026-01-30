pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        BACKEND_IMAGE = "microblog-backend:latest"
        FRONTEND_IMAGE = "microblog-frontend:latest"
    }

    stages {

        stage('Build Docker Images') {
            steps {
                sh '''
                    echo "Building Docker images..."
                    docker build -t ${BACKEND_IMAGE} ./backend
                    docker build -t ${FRONTEND_IMAGE} ./frontend
                    echo "Docker images built successfully"
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "Logging into Docker Hub..."
                        echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin

                        echo "Tagging images..."
                        docker tag ${BACKEND_IMAGE} ${DOCKER_USER}/${BACKEND_IMAGE}
                        docker tag ${FRONTEND_IMAGE} ${DOCKER_USER}/${FRONTEND_IMAGE}

                        echo "Pushing images..."
                        docker push ${DOCKER_USER}/${BACKEND_IMAGE}
                        docker push ${DOCKER_USER}/${FRONTEND_IMAGE}

                        docker logout
                        echo "Push completed successfully"
                    '''
                }
            }
        }

        stage('Deploy via Ansible') {
            steps {
                // Use SSH key stored in Jenkins Credentials
                withCredentials([sshUserPrivateKey(credentialsId: 'jenkins-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        echo "Deploying via Ansible..."
                        export ANSIBLE_HOST_KEY_CHECKING=False
                        ansible-playbook -i ansible/hosts.ini ansible/deploy.yml --private-key $SSH_KEY
                    '''
                }
            }
        }
    }

    post {
        success { echo "✓ Pipeline completed successfully" }
        failure { echo "✗ Pipeline failed" }
        always { cleanWs() }
    }
}

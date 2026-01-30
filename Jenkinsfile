pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        BACKEND_IMAGE  = 'microblog-backend:latest'
        FRONTEND_IMAGE = 'microblog-frontend:latest'
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
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        set -e
                        echo "Logging into Docker Hub..."
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        echo "Tagging images..."
                        docker tag ${BACKEND_IMAGE}  ${DOCKER_USER}/${BACKEND_IMAGE}
                        docker tag ${FRONTEND_IMAGE} ${DOCKER_USER}/${FRONTEND_IMAGE}

                        echo "Pushing images..."
                        docker push ${DOCKER_USER}/${BACKEND_IMAGE}
                        docker push ${DOCKER_USER}/${FRONTEND_IMAGE}

                        docker logout
                        echo "Docker push completed"
                    '''
                }
            }
        }

        stage('Deploy to EC2 using Ansible') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'jenkins-ssh-key',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    dir('ansible') {
                        sh '''
                            set -e
                            export ANSIBLE_HOST_KEY_CHECKING=False

                            ansible-playbook \
                              -i inventory \
                              -u "$SSH_USER" \
                              --private-key "$SSH_KEY" \
                              deploy.yml
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✓ Pipeline completed successfully"
        }
        failure {
            echo "✗ Pipeline failed"
        }
        always {
            cleanWs()
        }
    }
}

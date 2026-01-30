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
                '''
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                        docker tag ${BACKEND_IMAGE} ${DOCKER_USER}/${BACKEND_IMAGE}
                        docker tag ${FRONTEND_IMAGE} ${DOCKER_USER}/${FRONTEND_IMAGE}
                        docker push ${DOCKER_USER}/${BACKEND_IMAGE}
                        docker push ${DOCKER_USER}/${FRONTEND_IMAGE}
                        docker logout
                    '''
                }
            }
        }

        stage('Deploy via Ansible') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "Deploying via Ansible..."
                        ansible-playbook -i ansible/hosts.ini ansible/deploy.yml
                    '''
                }  // <-- closing withCredentials
            }  // <-- closing steps
        }  // <-- closing stage
    }
    
    post {
        success { echo "✓ Pipeline completed successfully" }
        failure { echo "✗ Pipeline failed" }
        always { cleanWs() }
    }
}  // <-- closing pipeline

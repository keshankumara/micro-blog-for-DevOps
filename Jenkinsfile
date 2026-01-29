pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        BACKEND_IMAGE = "microblog-backend:latest"
        FRONTEND_IMAGE = "microblog-frontend:latest"
        GIT_REPO = 'https://github.com/keshankumara/micro-blog-for-DevOps.git'
        GIT_BRANCH = 'main'
    }
    
    stages {
        stage('Checkout from GitHub') {
            steps {
                echo "Cloning from GitHub repository..."
                sh '''
                    rm -rf ./* || true
                    git clone -b ${GIT_BRANCH} ${GIT_REPO} .
                    echo "Repository cloned successfully"
                '''
            }
        }
        
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
                        
                        echo "Pushing images to Docker Hub..."
                        docker push ${DOCKER_USER}/${BACKEND_IMAGE}
                        docker push ${DOCKER_USER}/${FRONTEND_IMAGE}
                        
                        docker logout
                        echo "Push completed successfully"
                    '''
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


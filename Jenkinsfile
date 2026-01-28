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

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh '''
                        echo "Deploying to EC2..."
                        ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${SSH_USER}@13.223.88.252 << 'EOF'
                            # Pull latest images
                            sudo docker pull keshan01/microblog-backend:latest
                            sudo docker pull keshan01/microblog-frontend:latest
                            
                            # Restart backend
                            sudo docker stop microblog-backend || true
                            sudo docker rm microblog-backend || true
                            sudo docker run -d --name microblog-backend --network microblog-network \
                              -p 5000:5000 --restart unless-stopped \
                              -e NODE_ENV=production \
                              -e MONGO_URL='${MONGO_URL}' \
                              -e JWT_SECRET='your-secret-key-change-me' \
                              keshan01/microblog-backend:latest
                            
                            # Restart frontend
                            sudo docker stop microblog-frontend || true
                            sudo docker rm microblog-frontend || true
                            sudo docker run -d --name microblog-frontend --network microblog-network \
                              -p 80:80 --restart unless-stopped \
                              keshan01/microblog-frontend:latest
                            
                            echo "Deployment completed!"
EOF
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


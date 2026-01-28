pipeline {
    agent any

    environment {
        REGISTRY = 'docker.io'
        REGISTRY_CREDENTIALS = 'docker-registry-credentials'
        IMAGE_NAME_BACKEND = 'microblog-backend'
        IMAGE_NAME_FRONTEND = 'microblog-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo '🔄 Checking out code from repository...'
                    checkout scm
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo '🔨 Building backend Docker image...'
                    dir('backend') {
                        sh '''
                            docker build -t ${IMAGE_NAME_BACKEND}:${IMAGE_TAG} .
                            docker tag ${IMAGE_NAME_BACKEND}:${IMAGE_TAG} ${IMAGE_NAME_BACKEND}:latest
                        '''
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo '🔨 Building frontend Docker image...'
                    dir('frontend') {
                        sh '''
                            docker build -t ${IMAGE_NAME_FRONTEND}:${IMAGE_TAG} .
                            docker tag ${IMAGE_NAME_FRONTEND}:${IMAGE_TAG} ${IMAGE_NAME_FRONTEND}:latest
                        '''
                    }
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    echo '🧪 Running tests...'
                    sh '''
                        echo "Running backend tests..."
                        cd backend && npm test || true
                        cd ..
                        echo "Running frontend tests..."
                        cd frontend && npm test || true
                    '''
                }
            }
        }

        stage('Push Images') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '📤 Pushing images to registry...'
                    withCredentials([usernamePassword(credentialsId: env.REGISTRY_CREDENTIALS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker tag ${IMAGE_NAME_BACKEND}:${IMAGE_TAG} ${REGISTRY}/${DOCKER_USER}/${IMAGE_NAME_BACKEND}:${IMAGE_TAG}
                            docker tag ${IMAGE_NAME_FRONTEND}:${IMAGE_TAG} ${REGISTRY}/${DOCKER_USER}/${IMAGE_NAME_FRONTEND}:${IMAGE_TAG}
                            docker push ${REGISTRY}/${DOCKER_USER}/${IMAGE_NAME_BACKEND}:${IMAGE_TAG}
                            docker push ${REGISTRY}/${DOCKER_USER}/${IMAGE_NAME_FRONTEND}:${IMAGE_TAG}
                            docker logout
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '🚀 Deploying application...'
                    sh '''
                        docker-compose down || true
                        docker-compose up -d
                        sleep 10
                        docker-compose ps
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo '❤️ Performing health checks...'
                    sh '''
                        echo "Checking backend health..."
                        curl -f http://localhost:5000/ || exit 1
                        echo "Backend is healthy!"
                        
                        echo "Checking frontend health..."
                        curl -f http://localhost/ || exit 1
                        echo "Frontend is healthy!"
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo '📊 Cleaning up...'
                sh 'docker system prune -f || true'
            }
        }
        success {
            script {
                echo '✅ Pipeline completed successfully!'
            }
        }
        failure {
            script {
                echo '❌ Pipeline failed. Check logs for details.'
                sh 'docker-compose logs || true'
            }
        }
    }
}

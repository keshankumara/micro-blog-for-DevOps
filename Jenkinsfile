pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        BACKEND_IMAGE  = 'microblog-backend:latest'
        FRONTEND_IMAGE = 'microblog-frontend:latest'
    }

    stages {

        stage('Terraform') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']
                ]) {
                    dir('terraform') {
                        script {
                            sh 'terraform init -input=false'

                            def planStatus = sh(
                                script: 'terraform plan -detailed-exitcode -input=false -out=tfplan',
                                returnStatus: true
                            )

                            if (planStatus == 2) {
                                echo "Infrastructure changes detected. Applying..."
                                sh 'terraform apply -input=false tfplan'
                            } else if (planStatus == 0) {
                                echo 'No infrastructure changes detected; skipping apply.'
                            } else {
                                error 'Terraform plan failed.'
                            }
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -e
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
                    ),
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    dir('ansible') {
                        sh '''
                            set -e
                            export ANSIBLE_HOST_KEY_CHECKING=False

                            # Get dynamic public IP from Terraform output
                            PUBLIC_IP=$(terraform -chdir=../terraform output -raw instance_public_ip)

                            # Create dynamic inventory file
                            echo "[microblog]" > inventory
                            echo "$PUBLIC_IP ansible_user=ubuntu ansible_ssh_private_key_file=$SSH_KEY" >> inventory

                            # Run Ansible Playbook with Docker credentials
                            ansible-playbook -i inventory deploy.yml \
                              -e "dockerhub_username=$DOCKER_USER dockerhub_token=$DOCKER_PASS"
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

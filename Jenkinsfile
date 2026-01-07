pipeline{

    agent { label 'node1' }

    environment{
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT = '759210286431'
        ECR_URL = "${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_NAME = 'todo-frontend'
        ECR_REPO = "${ECR_URL}/${IMAGE_NAME}"
    }

    stages{

        stage('Checkout'){
            steps{
                checkout scm
                script {
                    env.IMAGE_TAG = env.GIT_COMMIT.take(7)
                }
            }
        }

        stage('Install Packages'){
            steps{
                sh 'npm install'
            }
        }

        stage('Code Quality Testing'){
            steps{
                sh 'npm run lint'
            }
        }

        stage('FS SCAN'){
            steps{
                sh '''
                    trivy fs \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    --no-progress \
                    .
                '''
            }
        }

        stage('Build Docker Image'){
            when{
                allOf {
                    expression { env.CHANGE_ID == null }   // NOT a PR
                    branch 'develop'
                }
            }
            steps{
                sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
            } 
        }

        /* =========================
            IMAGE SCAN (TRIVY)
           ========================= */
        stage('Scan Image'){
            when{
                allOf {
                    expression { env.CHANGE_ID == null }   // NOT a PR
                    branch 'develop'
                }
            }
            steps{
                echo "Scanning image with Trivy"

                sh """
                    trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --no-progress \
                        --skip-dirs /usr/local/lib/node_modules/npm \
                        ${ECR_REPO}:${IMAGE_TAG}
                """
            }
        }

        /* =========================
            PUSH IMAGE TO ECR
           ========================= */
        stage('Push to ECR'){
            when{
                allOf {
                    expression { env.CHANGE_ID == null }   // NOT a PR
                    branch 'develop'
                }
            }
            steps{
                sh """
                    aws ecr get-login-password --region=${AWS_REGION}\
                    | docker login --username AWS --password-stdin ${ECR_URL}

                    docker push ${ECR_REPO}:${IMAGE_TAG}
                """
            }
            post{
                always {
                    sh "docker rmi -f ${ECR_REPO}:${IMAGE_TAG} || true"
                }
            }
        }


        /* =========================
            DEPLOY TO DEV ENVIRONMENT
           ========================= */
        stage('Deploy to Dev Environment'){
            when{
                allOf {
                    expression { env.CHANGE_ID == null }   // NOT a PR
                    branch 'develop'
                }
            }
            steps{
                echo 'Deploying to dev environment of k8s...'

                script{
                    env.ECR_TOKEN = sh(script: "aws ecr get-login-password --region ap-south-1", returnStdout: true).trim()
                }

                withCredentials([file(credentialsId: 'jenkins-kubeconfig', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl create secret docker-registry ecr-secret \
                        --docker-server=759210286431.dkr.ecr.ap-south-1.amazonaws.com \
                        --docker-username=AWS \
                        --docker-password="$ECR_TOKEN" \
                        -n dev \
                        --dry-run=client -o yaml | kubectl apply -f -

                        helm upgrade --install my-frontend helm/my-frontend \
                        -f helm/my-frontend/values-dev.yaml \
                        -n dev \
                        --set image.tag=${IMAGE_TAG} \
                        --wait \
                        --timeout 5m \
                        --atomic
                    """
                }

            }
        }

        /* =========================
            DEPLOY TO PROD ENVIRONMENT
           ========================= */
        stage('Deploy to Prod Environment'){
            when{
                allOf {
                    expression { env.CHANGE_ID == null }   // NOT a PR
                    branch 'main'
                }
            }
            steps{
                echo 'Deploying to production environment of k8s...'
            }
        }
    }

}
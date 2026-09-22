pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '780603797380'
        ECR_REPO = 'athena-backend-cicd'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        EKS_CLUSTER = 'athena-cicd-cluster'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        IMAGE_URI = "${ECR_REGISTRY}/${ECR_REPO}:build-${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                    set -e
                    cd backend
                    mvn clean package -DskipTests
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -e
                    docker build \
                        -t "${ECR_REPO}:${IMAGE_TAG}" \
                        backend
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    set -e
                    aws ecr get-login-password \
                        --region "${AWS_REGION}" | \
                    docker login \
                        --username AWS \
                        --password-stdin "${ECR_REGISTRY}"
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                sh '''
                    set -e
                    docker tag "${ECR_REPO}:${IMAGE_TAG}" "${IMAGE_URI}"
                    docker push "${IMAGE_URI}"
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                    set -e

                    aws eks update-kubeconfig \
                        --region "${AWS_REGION}" \
                        --name "${EKS_CLUSTER}"

                    kubectl set image deployment/athena-backend \
                        athena-backend="${IMAGE_URI}"

                    kubectl rollout status deployment/athena-backend \
                        --timeout=180s
                '''
            }
        }
    }

    post {
        success {
            echo "Backend deployment successful: ${IMAGE_URI}"
        }

        failure {
            echo "Backend CI/CD failed."
        }

        always {
            sh '''
                docker image rm \
                    "${ECR_REPO}:${IMAGE_TAG}" \
                    "${IMAGE_URI}" 2>/dev/null || true
            '''
        }
    }
}

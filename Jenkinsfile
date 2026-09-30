pipeline {
    agent any

    triggers {
        githubPush()
    }

    tools {
        jdk 'jdk21'
        maven 'maven3'
    }

    environment {
        APP_NAME = 'task-manager'
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/task-manager-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/task-manager-frontend"
        DATABASE_IMAGE = "${DOCKERHUB_USERNAME}/task-manager-mysql"

        NEXUS_URL = credentials('nexus-url')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    stages {

        stage('1. Checkout') {
            steps {
                checkout scm
            }
        }

        stage('2. Build Application') {
            steps {
                dir('backend') {
                    sh 'mvn -B clean package -DskipTests'
                }
            }
        }

        stage('3. Unit Test') {
            steps {
                dir('backend') {
                    sh 'mvn -B test'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
                }
            }
        }

        stage('4. OWASP Dependency Check') {
            steps {
                dir('backend') {
                    sh '''
                        mvn -B dependency-check:check \
                          -DfailBuildOnCVSS=7 \
                          -Dformats=HTML,JSON
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts allowEmptyArchive: true,
                        artifacts: 'target/dependency-check/*',
                        fingerprint: true
                }
            }
        }

        stage('5. Integration Test') {
            steps {
                dir('backend') {
                    sh 'mvn -B -DskipTests failsafe:integration-test failsafe:verify'
                }
            }
        }

        stage('6. Deploy Artifact to Nexus') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus-credentials',
                        usernameVariable: 'NEXUS_USERNAME',
                        passwordVariable: 'NEXUS_PASSWORD'
                    )
                ]) {
                    dir('backend') {
                        sh '''
                            mvn -B deploy \
                              -DskipTests \
                              -DaltDeploymentRepository=nexus-releases::default:${NEXUS_URL}/repository/maven-releases/
                        '''
                    }
                }
            }
        }

        stage('7. Build Docker Images') {
            steps {
                sh '''
                    docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} backend
                    docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} frontend
                    docker build -t ${DATABASE_IMAGE}:${BUILD_NUMBER} database

                    docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest
                    docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest
                    docker tag ${DATABASE_IMAGE}:${BUILD_NUMBER} ${DATABASE_IMAGE}:latest
                '''
            }
        }

        stage('8. Trivy Image Scan') {
            steps {
                sh '''
                    trivy image --exit-code 1 --severity HIGH,CRITICAL \
                      ${BACKEND_IMAGE}:${BUILD_NUMBER}

                    trivy image --exit-code 1 --severity HIGH,CRITICAL \
                      ${FRONTEND_IMAGE}:${BUILD_NUMBER}

                    trivy image --exit-code 1 --severity HIGH,CRITICAL \
                      ${DATABASE_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        stage('9. Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "${DOCKER_PASSWORD}" | docker login \
                          -u "${DOCKER_USER}" --password-stdin

                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${BACKEND_IMAGE}:latest

                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${FRONTEND_IMAGE}:latest

                        docker push ${DATABASE_IMAGE}:${BUILD_NUMBER}
                        docker push ${DATABASE_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }

        success {
            echo 'CI pipeline completed successfully.'
        }

        failure {
            echo 'CI pipeline failed. Check the failed stage and Jenkins console output.'
        }
    }
}

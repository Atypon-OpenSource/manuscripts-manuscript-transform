pipeline {
    agent {
        docker {
            image 'node:lts-iron'
            args '--userns=host \
                  --security-opt seccomp:unconfined \
                  -v /home/ci/.cache/yarn:/.cache/yarn \
                  -v /home/ci/.npm:/.npm'
        }
    }
    parameters {
        booleanParam(name: 'PUBLISH', defaultValue: false)
    }
    stages {
        stage('Build') {
            steps {
                sh 'yarn install --non-interactive --frozen-lockfile'
                sh 'yarn version-file'
                sh 'yarn typecheck'
                sh 'yarn lint'
                // sh 'yarn test'
                sh 'yarn build'
            }
        }
        stage ('Publish') {
            when {
                expression { params.PUBLISH == true }
            }
            environment {
                NPM_TOKEN = credentials('NPM_TOKEN_MANUSCRIPTS_OSS')
            }
            steps {
                sh 'npx @manuscripts/publish'
            }
        }
    }
}

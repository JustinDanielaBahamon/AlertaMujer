// App móvil ALERTA MUJER (Expo): ESLint, tipos y pruebas en cada push. El APK se genera solo a mano:
// "Construir con parámetros" → GENERAR_APK. Usa EAS con la credencial expo-token de Jenkins; el
// google-services.json debe estar en EAS como variable de archivo GOOGLE_SERVICES_JSON.
pipeline {
  agent any
  options {
    timestamps()
    timeout(time: 40, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '15'))
    disableConcurrentBuilds()
  }
  parameters {
    booleanParam(name: 'GENERAR_APK', defaultValue: false,
                 description: 'Envía a EAS la construcción del APK (perfil preview)')
  }

  stages {
    stage('Dependencias') {
      steps {
        dir('Frontend-movil') {
          sh 'npm ci --no-audit --no-fund'
        }
      }
    }

    // Errores de ESLint (p. ej. react-hooks/rules-of-hooks: un hook detrás de un return cerraba la app)
    stage('Lint') {
      steps {
        dir('Frontend-movil') {
          sh 'npx eslint . --quiet'
        }
      }
    }

    stage('Tipos') {
      steps {
        dir('Frontend-movil') {
          sh 'npx tsc --noEmit'
        }
      }
    }

    stage('Pruebas') {
      steps {
        dir('Frontend-movil') {
          sh 'npx jest --ci'
        }
      }
    }

    stage('APK (EAS)') {
      when { expression { params.GENERAR_APK } }
      steps {
        dir('Frontend-movil') {
          withCredentials([string(credentialsId: 'expo-token', variable: 'EXPO_TOKEN')]) {
            // --no-wait: EAS compila en sus servidores; el enlace del APK sale en el log y en expo.dev
            sh 'npx --yes eas-cli build -p android --profile preview --non-interactive --no-wait'
          }
        }
      }
    }
  }

  post {
    always { cleanWs() }
  }
}

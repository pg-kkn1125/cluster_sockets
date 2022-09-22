module.exports = {
  apps: [
    {
      name: "yegan_socket_server", // 앱 이름
      // script: "./index.js", // 스크립트 파일 위치
      script: "src/index.js", // 스크립트 파일 위치
      // max_memory_restart: "300M", process memory가 300mb에 도달하면 reload 실행
      instances: 6, // 0 | "max" = CPU 코어 수 만큼 프로세스를 생성
      exec_mode: "cluster", // 애플리케이션을 클러스터 모드로 실행
      // exec_mode: "cluster", // 애플리케이션을 클러스터 모드로 실행
      wait_ready: true, // 마스터 프로세스에게 ready 이벤트를 기다리라는 의미
      // listen_timeout: 50000, // ready 이벤트를 기다릴 시간값(ms)을 의미
      // kill_timeout: 5000, // 새로운 요청을 더 이상 받지 않고 연결되어 있는 요청이 완료된 후 해당 프로세스를 강제로 종료하도록 처리
      watch: true, // watch 여부
      // watch: ["server", "client"], // 감시할 폴더 설정
      // watch_delay: 1000, watch 딜레이 인터벌
      // ignore_watch: ["node_modules"], // watch 제외 대상
      env: {
        // 실행 시 환경 변수 설정
        HOST: "localhost",
        PORT: 3000,
        THREAD: 0,
      },
      env_production: {
        // 개발 환경별 환경 변수 설정
        NODE_ENV: "production",
      },
      env_development: {
        // 개발 환경별 환경 변수 설정
        NODE_ENV: "development",
      },
    },
  ],
};

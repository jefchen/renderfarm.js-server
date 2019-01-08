module.exports = {
    version: "1.0.3",
    common: {
        workgroup: "default",
        host: "localhost",
        port: 8000,
        publicUrl: "https://localhost:8000",
        workerManagerPort: 17900,
        heartbeatPort: 3000,
        sslKey: "ssl/key.pem",
        sslCert: "ssl/cert.pem",
        renderOutputDir: "C:\\\\Temp",
        renderOutputLocal: "C:\\\\Temp",
        apiKeyCheck: true,
        workspaceCheck: true,
        deleteDeadWorkers: true,
        expireSessions: true,
        sessionTimeoutMinutes: 30
    },
    dev: {
        connectionUrl: "mongodb://rfarmmgr:123456@192.168.0.151:27017/rfarmdb",
        databaseName: "rfarm-dev",
        collectionPrefix: "_dev",
        sessionTimeoutMinutes: 5
    },
    test: {
        connectionUrl: "mongodb://rfarmmgr:123456@192.168.0.151:27017/rfarmdb",
        databaseName: "rfarm-test",
        collectionPrefix: "_test",
        expireSessions: false,
        deleteDeadWorkers: false
    },
    prod: {
        publicUrl: "https://localhost:8000",
        connectionUrl: "mongodb://rfarmmgr:123456@192.168.0.151:27017/rfarmdb",
        databaseName: "rfarm-prod",
        collectionPrefix: "",
        workgroup: "default",
        host: "localhost",
        port: 8000,
        workerManagerPort: 17900,
        sslKey: "ssl/key.pem",
        sslCert: "ssl/cert.pem",
        renderOutputDir: "C:\\\\Temp",
        renderOutputLocal: "C:\\\\Temp",
        apiKeyCheck: true,
        workspaceCheck: true,
        deleteDeadWorkers: true,
        expireSessions: true,
        sessionTimeoutMinutes: 30
    }
};
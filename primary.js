import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import fs from 'fs';
import path from 'path';
import { initializeReplicas, executeTask } from './common/execute.js';

const PROTO_PATH = './tasks.proto';  // Ensure this path is correct

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const taskProto = protoDescriptor.TaskService;

const replicas = [
    {address: '15.206.157.97:80', client: null}
    // { address: 'greplica:50051', client: null }
    // { address: 'localhost:50051', client: null }
    // { address: 'localhost:50052', client: null }
];

replicas.forEach(replica => {
    replica.client = new taskProto(replica.address, grpc.credentials.createInsecure());
});

// Read business logic from file
const code = fs.readFileSync('./businessLogic/businessLogic.js', 'utf8');

// Extract function body
const functionBody = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));

// Initialize replicas with business logic
function distribute(call, callback) {
    initializeReplicas(replicas, functionBody, callback);
}

// Execute task
function execute(call, callback) {
    const { task } = call.request;
    executeTask(replicas, task, callback);
}

const server = new grpc.Server();
server.addService(taskProto.service, { Initialize: distribute, Execute: execute });
// Run distribute function immediately after server setup
initializeReplicas(replicas, functionBody, (err, response) => {
    if (err) {
        console.error('Error initializing replicas:', err);
    } else {
        console.log('Replicas initialized successfully');
        server.bindAsync('0.0.0.0:50050', grpc.ServerCredentials.createInsecure(), () => {
            server.start();
            console.log('Server started on port 50050');
        });
    }

// server.bindAsync('0.0.0.0:50050', grpc.ServerCredentials.createInsecure(), () => {
//     server.start();
});

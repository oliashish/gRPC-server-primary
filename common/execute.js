import grpc from '@grpc/grpc-js';

export function initializeReplicas(replicas, code, callback) {
    let count = 0;
    replicas.forEach(replica => {
        replica.client.Initialize({ code }, (err, response) => {
            if (err) console.error(err);
            else console.log(response.message);
            if (++count === replicas.length) callback(null, { message: 'Code distributed to replicas' });
        });
    });
}

export function executeTask(replicas, task, callback) {
    const replica = replicas[Math.floor(Math.random() * replicas.length)];
    replica.client.Execute({ task }, (err, response) => {
        if (err) callback(err, null);
        else callback(null, response);
    });
}

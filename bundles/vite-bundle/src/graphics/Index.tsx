import React, { useState, useEffect } from 'react';

// Helper hook for NodeCG replicants
type RedisMessage = { id: string; data: Record<string, string> };

function useReplicant<T>(name: string, defaultValue: T): T {
	const [val, setVal] = useState<T>(defaultValue);
	useEffect(() => {
		const rep = nodecg.Replicant<T>(name);
		const update = (newVal: T | undefined) => {
			setVal(newVal ?? defaultValue);
		};
		rep.on('change', update);
		return () => {
			rep.removeListener('change', update);
		};
	}, [name, defaultValue]);
	return val;
}

export function Index() {
	const streamLen = useReplicant<number>('redisStreamLen', 0);
	const messages = useReplicant<RedisMessage[]>('redisLatestMessages', []);

	return (
		<>
			<div style={{ position: 'absolute', top: 10, left: 10, padding: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '4px' }}>
				<h3 style={{ marginTop: 0 }}>Redis Stream ({streamLen})</h3>
				<ul style={{ maxHeight: '300px', overflowY: 'auto', listStyle: 'none', paddingLeft: 0 }}>
					{messages.map((msg) => (
						<li key={msg.id} style={{ fontFamily: 'monospace', marginBottom: '4px' }}>
							<strong>{msg.id}</strong>: {JSON.stringify(msg.data)}
						</li>
					))}
				</ul>
			</div>
		</>
	);
}

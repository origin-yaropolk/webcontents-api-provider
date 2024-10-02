import React from 'react';
import { createRoot } from 'react-dom/client';

import { Worker } from './worker';

const documentRoot = document.getElementById('root');

if (documentRoot) {
	const root = createRoot(documentRoot);
	root.render(<Worker/>);
}

import { createRoot } from 'react-dom/client';
import { ProposalPage } from '../components/ProposalPage';
import type { ProposalConfig } from '../types';
import '../index.css';

const config = JSON.parse(document.getElementById('proposal-config')!.textContent!) as ProposalConfig;
createRoot(document.getElementById('root')!).render(<ProposalPage config={config} />);

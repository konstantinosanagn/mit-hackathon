'use client';

import { WorkspaceProvider } from '@/components/workspace/WorkspaceProvider';
import WorkspaceController from '@/components/workspace/WorkspaceController';
import WorkspaceLayout from '@/components/workspace/WorkspaceLayout';

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <WorkspaceController>
        {({ headerProps, chatPanelProps, previewPanelProps, project, sandboxStatus }) => (
          <WorkspaceLayout
            headerProps={headerProps}
            chatPanelProps={chatPanelProps}
            previewPanelProps={previewPanelProps}
            project={project}
            sandboxStatus={sandboxStatus}
          />
        )}
      </WorkspaceController>
    </WorkspaceProvider>
  );
}

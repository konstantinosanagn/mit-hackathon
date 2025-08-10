'use client';

import { WorkspaceProvider } from '@/components/workspace/WorkspaceProvider';
import WorkspaceController from '@/components/workspace/WorkspaceController';
import WorkspaceLayout from '@/components/workspace/WorkspaceLayout';

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <WorkspaceController>
        {({ headerProps, chatPanelProps, previewPanelProps }) => (
          <WorkspaceLayout
            headerProps={headerProps}
            chatPanelProps={chatPanelProps}
            previewPanelProps={previewPanelProps}
          />
        )}
      </WorkspaceController>
    </WorkspaceProvider>
  );
}

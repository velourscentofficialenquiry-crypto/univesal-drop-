import React, { useState } from 'react';
import { useAirDrop } from './hooks/useAirDrop';
import { Header } from './components/Header';
import { RadarView } from './components/RadarView';
import { IncomingTransferModal } from './components/IncomingTransferModal';
import { ActiveTransferModal } from './components/ActiveTransferModal';
import { TextDropModal } from './components/TextDropModal';
import { QRCodeModal } from './components/QRCodeModal';
import { DeviceSettingsModal } from './components/DeviceSettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PlatformGuideModal } from './components/PlatformGuideModal';
import { PeerInfo } from './types';

export default function App() {
  const {
    myPeer,
    peers,
    roomId,
    connected,
    activeTransfer,
    history,
    autoAccept,
    updateMyPeer,
    changeRoom,
    sendFilesToPeer,
    sendTextToPeer,
    acceptTransfer,
    rejectTransfer,
    cancelTransfer,
    closeTransferModal,
    toggleAutoAccept,
    clearHistory
  } = useAirDrop();

  // Modals state
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [textDropTarget, setTextDropTarget] = useState<PeerInfo | null>(null);

  const handleOpenTextDrop = (targetPeer: PeerInfo) => {
    setTextDropTarget(targetPeer);
  };

  const handleCloseTextDrop = () => {
    setTextDropTarget(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* App Header with Connection, Room, and Tools */}
      <Header
        myPeer={myPeer}
        roomId={roomId}
        connected={connected}
        historyCount={history.length}
        onOpenQR={() => setShowQRModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenHistory={() => setShowHistoryDrawer(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        onChangeRoom={changeRoom}
      />

      {/* Main AirDrop Radar Canvas */}
      <RadarView
        myPeer={myPeer}
        peers={peers}
        roomId={roomId}
        connected={connected}
        onSendFiles={sendFilesToPeer}
        onSendText={handleOpenTextDrop}
        onOpenQR={() => setShowQRModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Incoming AirDrop Prompt Modal */}
      {activeTransfer && activeTransfer.status === 'incoming_prompt' && (
        <IncomingTransferModal
          transfer={activeTransfer}
          onAccept={() => acceptTransfer(activeTransfer)}
          onDecline={() => rejectTransfer()}
        />
      )}

      {/* Active Transfer Progress & Complete Modal */}
      {activeTransfer && activeTransfer.status !== 'incoming_prompt' && (
        <ActiveTransferModal
          transfer={activeTransfer}
          onCancel={cancelTransfer}
          onClose={closeTransferModal}
        />
      )}

      {/* Send Quick Text / Link Snippet Modal */}
      {textDropTarget && (
        <TextDropModal
          targetPeer={textDropTarget}
          onSend={sendTextToPeer}
          onClose={handleCloseTextDrop}
        />
      )}

      {/* QR Code Instant Phone Scan Modal */}
      {showQRModal && (
        <QRCodeModal
          roomId={roomId}
          onChangeRoom={changeRoom}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Device Name & Customizer Modal */}
      {showSettingsModal && (
        <DeviceSettingsModal
          myPeer={myPeer}
          autoAccept={autoAccept}
          onUpdatePeer={updateMyPeer}
          onToggleAutoAccept={toggleAutoAccept}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Transfer History Drawer */}
      {showHistoryDrawer && (
        <HistoryDrawer
          history={history}
          onClear={clearHistory}
          onClose={() => setShowHistoryDrawer(false)}
        />
      )}

      {/* Cross-Platform Setup & Tips Guide */}
      {showGuideModal && (
        <PlatformGuideModal
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </div>
  );
}

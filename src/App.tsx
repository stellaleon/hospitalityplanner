import { useState } from 'react';
import { Layout } from './components/Layout';
import { DesktopGrid } from './components/DesktopGrid';
import { MobileAgenda } from './components/MobileAgenda';
import { ReservationModal } from './components/ReservationModal';
import type { Room, Reservation } from './types';

function App() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    room: Room | null;
    date: Date | null;
    existingReservation?: Reservation;
  }>({
    isOpen: false,
    room: null,
    date: null,
  });

  const handleCellClick = (room: Room, date: Date, res?: Reservation) => {
    setModalState({
      isOpen: true,
      room,
      date,
      existingReservation: res
    });
  };

  const closeModal = () => setModalState({ isOpen: false, room: null, date: null });

  return (
    <Layout>
      <DesktopGrid onDayClick={handleCellClick} />
      <MobileAgenda onReservationClick={handleCellClick} />
      
      {modalState.isOpen && modalState.room && modalState.date && (
        <ReservationModal
          room={modalState.room}
          initialDate={modalState.date}
          existingReservation={modalState.existingReservation}
          onClose={closeModal}
        />
      )}
    </Layout>
  );
}

export default App;

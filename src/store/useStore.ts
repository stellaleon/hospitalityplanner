import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room, Reservation } from '../types';

interface AppState {
  rooms: Room[];
  reservations: Reservation[];
  currentMonthStr: string; // ISO string representation of the first day of current month e.g., '2026-03-01'
  selectedDateStr: string; // ISO string e.g., '2026-03-27'
  roomStatuses: Record<string, 'Occupata' | 'Libera' | 'Prenotata' | 'Da pulire'>;
  setCurrentMonthStr: (dateStr: string) => void;
  setSelectedDateStr: (dateStr: string) => void;
  setRoomStatus: (roomId: string, dateStr: string, status: 'Occupata' | 'Libera' | 'Prenotata' | 'Da pulire') => void;
  addReservation: (rev: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, rev: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  updateRoom: (id: string, name: string) => void;
  importData: (jsonData: string) => void;
}

const defaultRooms: Room[] = [
  { id: 'cam-1', name: 'CAM 1' },
  { id: 'cam-2', name: 'CAM 2' },
  { id: 'cam-3', name: 'CAM 3' },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      rooms: defaultRooms,
      reservations: [],
      roomStatuses: {},
      // Default to today's month and today
      currentMonthStr: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      selectedDateStr: new Date().toISOString().split('T')[0],
      
      setCurrentMonthStr: (dateStr) => set({ currentMonthStr: dateStr }),
      setSelectedDateStr: (dateStr) => set({ selectedDateStr: dateStr }),
      setRoomStatus: (roomId, dateStr, status) => set((state) => ({
        roomStatuses: { ...state.roomStatuses, [`${roomId}-${dateStr}`]: status }
      })),
      
      addReservation: (rev) => set((state) => ({
        reservations: [...state.reservations, { ...rev, id: crypto.randomUUID() }]
      })),
      
      updateReservation: (id, rev) => set((state) => ({
        reservations: state.reservations.map(r => r.id === id ? { ...r, ...rev } : r)
      })),
      
      deleteReservation: (id) => set((state) => ({
        reservations: state.reservations.filter(r => r.id !== id)
      })),
      
      updateRoom: (id, name) => set((state) => ({
        rooms: state.rooms.map(r => r.id === id ? { ...r, name } : r)
      })),
      
      importData: (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (parsed && Array.isArray(parsed.reservations)) {
            set({
              reservations: parsed.reservations,
              rooms: parsed.rooms || defaultRooms
            });
          }
        } catch (e) {
          console.error("Failed to import data", e);
        }
      }
    }),
    {
      name: 'hotel-planning-storage',
      partialize: (state) => ({
        rooms: state.rooms,
        reservations: state.reservations,
        roomStatuses: state.roomStatuses
      }),
    }
  )
);

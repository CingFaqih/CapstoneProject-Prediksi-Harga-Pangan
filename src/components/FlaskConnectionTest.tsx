
import { useEffect } from 'react';
import {
  testFlaskConnection,
  testGetCommodities,
} from '../services/flaskConnection';

export default function FlaskConnectionTest() {
  useEffect(() => {
    let active = true;

    async function runConnectionTest() {
      console.log('=== PENGUJIAN KONEKSI SISTEM ===');

      try {
        const connection = await testFlaskConnection();

        if (!active) return;

        console.log(' React → Flask → MySQL berhasil');
        console.log('Database:', connection.database);
        console.log('Pesan:', connection.message);

        const commodities = await testGetCommodities();

        if (!active) return;

        console.log(' Data komoditas berhasil diambil');
        console.log('Jumlah komoditas:', commodities.length);
        console.table(commodities);

        console.log('=== PENGUJIAN SELESAI ===');
      } catch (error) {
        if (!active) return;

        console.error('❌ Pengujian koneksi gagal:', error);
      }
    }

    runConnectionTest();

    return () => {
      active = false;
    };
  }, []);

  return null;
}

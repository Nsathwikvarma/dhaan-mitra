import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';

export default function NativeApp() {
  const [role, setRole] = useState('FARMER');
  const [tab, setTab] = useState('HOME');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />
      
      {/* Native App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌾 Dhaan Mitra (ధాన్ మిత్ర)</Text>
        <TouchableOpacity style={styles.roleBtn} onPress={() => setRole(role === 'FARMER' ? 'PROCURER' : 'FARMER')}>
          <Text style={styles.roleBtnText}>{role === 'FARMER' ? 'Farmer Mode' : 'Procurer Mode'}</Text>
        </TouchableOpacity>
      </View>

      {/* Native ScrollView (Guarantees Smooth Touch Scrolling on Android/iOS) */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌾 Farmer Procurement Dashboard</Text>
          <Text style={styles.cardText}>Aadhaar Seeded & Verified: SBI A/C ****4821</Text>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.featureCard} onPress={() => alert('Opening Slot Booking')}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureTitle}>Book Slot</Text>
            <Text style={styles.featureSub}>Current Month Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={() => alert('Opening Payment Tracking')}>
            <Text style={styles.featureIcon}>💳</Text>
            <Text style={styles.featureTitle}>Payment Tracking</Text>
            <Text style={styles.featureSub}>Govt Estimated Dates</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={() => alert('Opening Weather')}>
            <Text style={styles.featureIcon}>🌤️</Text>
            <Text style={styles.featureTitle}>Live Weather</Text>
            <Text style={styles.featureSub}>31.5°C • Rain 10%</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={() => alert('Opening Dhaan Report')}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureTitle}>Dhaan Report</Text>
            <Text style={styles.featureSub}>Moisture Spot Pins</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mainBtn}>
          <Text style={styles.mainBtnText}>📅 Book New Procurement Slot</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Native Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setTab('HOME')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setTab('BOOK')}>
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navLabel}>Book Slot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setTab('PAY')}>
          <Text style={styles.navIcon}>💳</Text>
          <Text style={styles.navLabel}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setTab('REPORT')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#064e3b',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  roleBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#064e3b',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: '#64748b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  featureSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  mainBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  mainBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  navBar: {
    height: 60,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
  },
});

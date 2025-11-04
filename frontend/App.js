import React, { useRef, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Animated, Easing, ImageBackground, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function App() {
  const [items, setItems] = useState([]);
  const [randomItem, setRandomItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scaleFull = useRef(new Animated.Value(1)).current;
  const scaleSurprise = useRef(new Animated.Value(1)).current;

  const runIntro = () => {
    fadeIn.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.quad) })
    ]).start();
  };

  const fetchMenu = async () => {
    setLoading(true);
    setError('');
    setRandomItem(null);
    try {
      const res = await fetch(`${API_URL}/menu`);
      const json = await res.json();
      if (!json.success) throw new Error('Failed to load menu');
      setItems(json.data);
      runIntro();
    } catch (e) {
      setError('Could not load menu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRandom = async () => {
    setLoading(true);
    setError('');
    setItems([]);
    try {
      const exclude = randomItem?._id ? `?exclude=${encodeURIComponent(randomItem._id)}&ts=${Date.now()}` : `?ts=${Date.now()}`;
      const res = await fetch(`${API_URL}/menu/random${exclude}`);
      const json = await res.json();
      if (!json.success) throw new Error('Failed to load item');
      setRandomItem(json.data);
      runIntro();
    } catch (e) {
      setError('Could not load random item.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.card, { opacity: fadeIn, transform: [{ translateY }] }]}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>{item.category}</Text>
      <Text style={styles.price}>Rs. {item.price.toFixed(2)}</Text>
      <Text style={[styles.stock, { color: item.inStock ? '#16a34a' : '#dc2626' }]}>
        {item.inStock ? 'In Stock' : 'Out of Stock'}
      </Text>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.smallButton, styles.linkBtn]}
          onPress={() => { setSelected(item); setShowDetails(true); }}
        >
          <Text style={styles.linkText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.smallButton, styles.addBtn]}
          disabled={!item.inStock}
          onPress={() => setCart((c) => [...c, item])}
        >
          <Text style={styles.addText}>{item.inStock ? 'Add to Cart' : 'Unavailable'}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop' }}
      style={styles.bg}
      resizeMode="cover"
    >
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Coffee Shop</Text>
          <View style={styles.cartBadge}><Text style={styles.cartText}>{cart.length}</Text></View>
        </View>
        <Text style={styles.subtitle}>Discover your next favorite cup</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primary]}
            onPress={fetchMenu}
            activeOpacity={0.9}
            onPressIn={() => Animated.spring(scaleFull, { toValue: 0.97, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scaleFull, { toValue: 1, useNativeDriver: true }).start()}
          >
            <Animated.View style={{ transform: [{ scale: scaleFull }] }}>
              <Text style={styles.buttonText}>Full Menu</Text>
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondary]}
            onPress={fetchRandom}
            activeOpacity={0.9}
            onPressIn={() => Animated.spring(scaleSurprise, { toValue: 0.97, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scaleSurprise, { toValue: 1, useNativeDriver: true }).start()}
          >
            <Animated.View style={{ transform: [{ scale: scaleSurprise }] }}>
              <Text style={styles.buttonText}>Surprise Me</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      

      {loading && (
        <View style={styles.center}> 
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.hint}>Loading...</Text>
        </View>
      )}

      {!!error && (
        <View style={styles.center}> 
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      {randomItem && (
        <View style={styles.randomWrapper}>
          {renderItem({ item: randomItem })}
        </View>
      )}

      {!randomItem && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          style={styles.listFlex}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      </View>
    </SafeAreaView>

    {/* Details Modal */}
    <Modal visible={showDetails} transparent animationType="fade" onRequestClose={() => setShowDetails(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {selected && (
            <>
              <Text style={styles.modalTitle}>{selected.name}</Text>
              <Text style={styles.modalMeta}>{selected.category}</Text>
              <Text style={styles.modalPrice}>Rs. {selected.price?.toFixed(2)}</Text>
              <Text style={[styles.modalStock, { color: selected.inStock ? '#16a34a' : '#dc2626' }]}>
                {selected.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => setShowDetails(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primary]}
                  disabled={!selected.inStock}
                  onPress={() => { setCart((c) => [...c, selected]); setShowDetails(false); }}
                >
                  <Text style={styles.buttonText}>{selected.inStock ? 'Add to Cart' : 'Unavailable'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  content: { width: '100%', maxWidth: 820, paddingHorizontal: 16, flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 },
  title: { fontSize: 36, fontWeight: '800', textAlign: 'center', color: '#ffffff' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#e5e7eb', marginBottom: 16, marginTop: 6 },
  cartBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  cartText: { color: '#fff', fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8, justifyContent: 'center' },
  button: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, minWidth: 150, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  primary: { backgroundColor: '#8b5cf6' },
  secondary: { backgroundColor: '#10b981' },
  buttonText: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, paddingBottom: 56 },
  listFlex: { flex: 1 },
  card: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 18, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  name: { fontSize: 18, fontWeight: '800', color: '#0b1020' },
  meta: { color: '#4b5563', marginTop: 6 },
  price: { color: '#0f766e', fontWeight: '800', marginTop: 8 },
  stock: { marginTop: 6, fontWeight: '600' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  smallButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  linkBtn: { backgroundColor: '#f3f4f6' },
  addBtn: { backgroundColor: '#0ea5e9' },
  linkText: { color: '#111827', fontWeight: '700' },
  addText: { color: '#ffffff', fontWeight: '700' },
  randomWrapper: { padding: 16 },
  center: { alignItems: 'center', padding: 16 },
  hint: { color: '#e5e7eb', marginTop: 8 },
  error: { color: '#fecaca', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { backgroundColor: '#ffffff', width: '100%', maxWidth: 480, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0b1020' },
  modalMeta: { marginTop: 6, color: '#4b5563' },
  modalPrice: { marginTop: 10, color: '#0f766e', fontWeight: '800' },
  modalStock: { marginTop: 6, fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 16 }
});



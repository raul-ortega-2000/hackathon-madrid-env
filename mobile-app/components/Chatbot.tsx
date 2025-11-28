import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CategoryInfo } from '../App';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  visible: boolean;
  onClose: () => void;
  zone: string;
  categories: Record<string, CategoryInfo>;
}

export default function Chatbot({ visible, onClose, zone, categories }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `¡Hola! Soy tu asistente de impacto ecológico en Madrid. Estás en ${zone}. ¿En qué puedo ayudarte? Puedes preguntarme sobre la calidad del aire, reciclaje, energía, o cualquier aspecto ambiental de tu zona.`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare context about the zone and available data
      const contextData = {
        zone,
        airQuality: categories.airQuality?.data?.level || 'No disponible',
        recycling: categories.recycling?.data?.level || 'No disponible',
        water: categories.water?.data?.level || 'No disponible',
        energy: categories.energy?.data?.level || 'No disponible',
      };

      const response = await fetchChatbotResponse(inputText, contextData);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.chatContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Asistente de Impacto Ecológico</Text>
            <Text style={styles.headerSubtitle}>{zone}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.botMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.botMessageText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View style={[styles.messageContainer, styles.botMessage]}>
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor="#999"
              multiline
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Chatbot API integration
async function fetchChatbotResponse(
  userMessage: string,
  context: {
    zone: string;
    airQuality: string;
    recycling: string;
    water: string;
    energy: string;
  }
): Promise<string> {
  // Option 1: Use OpenAI API (requires API key)
  // Uncomment and add your OpenAI API key to use this
  /*
  try {
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Add to environment variables
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente experto en impacto ecológico en Madrid. 
            El usuario está en ${context.zone}. 
            Datos actuales: Calidad del aire: ${context.airQuality}, Residuos: ${context.recycling}, 
            Agua: ${context.water}, Energía: ${context.energy}. 
            Responde en español, sé conciso y proporciona datos específicos y medibles cuando sea posible.`,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'No pude procesar tu pregunta.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to rule-based
  }
  */
  
  // Option 2: Rule-based system (current implementation for demo)
  const message = userMessage.toLowerCase();
  
  // Context-aware responses
  if (message.includes('calidad del aire') || message.includes('aire') || message.includes('contaminación')) {
    return `En ${context.zone}, la calidad del aire es ${context.airQuality}. ` +
           `Te recomiendo evitar vehículos de combustión y usar transporte público cuando sea posible. ` +
           `Esto puede reducir tus emisiones de CO2 hasta en 2.5 kg por cada 10 km evitados y mejorar la calidad del aire en un 15-20% en tu zona. ` +
           `¿Te gustaría saber más sobre cómo reducir tu impacto en la calidad del aire?`;
  }
  
  if (message.includes('reciclaje') || message.includes('residuos') || message.includes('basura')) {
    return `En ${context.zone}, la gestión de residuos está en nivel ${context.recycling}. ` +
           `Reciclar correctamente puede ahorrar hasta 700 kWh de energía por tonelada de material reciclado y reducir la huella de carbono en un 30-40%. ` +
           `Separar residuos orgánicos puede generar 150 kg de compost por persona al año. ` +
           `¿Te gustaría saber dónde están los puntos de reciclaje más cercanos?`;
  }
  
  if (message.includes('agua') || message.includes('calidad del agua')) {
    return `La calidad del agua en ${context.zone} está en nivel ${context.water}. ` +
           `Usar filtros domésticos puede reducir la exposición a contaminantes en un 80-90%. ` +
           `También te recomiendo reducir el consumo de agua embotellada: evitar 1 botella al día ahorra 365 botellas al año, ` +
           `reduciendo 8 kg de plástico y evitando 12 kg de CO2 en su producción.`;
  }
  
  if (message.includes('energía') || message.includes('energético') || message.includes('consumo')) {
    return `El uso energético en ${context.zone} está en nivel ${context.energy}. ` +
           `Reducir tu consumo en un 20% puede ahorrar 400 kWh/año por hogar, ` +
           `equivalente a evitar 200 kg de CO2 anuales y ahorrar 60€ en la factura. ` +
           `Usar electrodomésticos eficientes y programar consumos en horas de menor demanda ayuda significativamente.`;
  }
  
  if (message.includes('impacto') || message.includes('huella') || message.includes('ecológico')) {
    return `Tu impacto ecológico en ${context.zone} depende de varios factores. ` +
           `Basándome en los datos de tu zona: calidad del aire ${context.airQuality}, ` +
           `residuos ${context.recycling}, agua ${context.water}, energía ${context.energy}. ` +
           `Acciones clave para reducir tu impacto: usar transporte público (reduce 1.2 kg CO2 por viaje), ` +
           `reciclar correctamente (ahorra 700 kWh por tonelada), y reducir consumo energético (ahorra 400 kWh/año). ` +
           `¿Sobre qué aspecto específico te gustaría saber más?`;
  }
  
  if (message.includes('recomendación') || message.includes('consejo') || message.includes('qué hacer')) {
    return `Para ${context.zone}, te recomiendo: ` +
           `1) Usar transporte público para mejorar la calidad del aire (reduce 1.2 kg CO2 por viaje), ` +
           `2) Reciclar correctamente en los puntos disponibles (ahorra 700 kWh por tonelada), ` +
           `3) Reducir el consumo energético en horas punta (ahorra 400 kWh/año), ` +
           `4) Visitar espacios verdes cercanos (reduce estrés 30% y mejora bienestar). ` +
           `¿Quieres más detalles sobre alguna de estas recomendaciones?`;
  }
  
  if (message.includes('hola') || message.includes('ayuda') || message.includes('help')) {
    return `¡Hola! Puedo ayudarte con información sobre tu impacto ecológico en ${context.zone}. ` +
           `Puedes preguntarme sobre: calidad del aire, reciclaje, agua, energía, espacios verdes, ` +
           `o cualquier aspecto ambiental. También puedo darte recomendaciones personalizadas basadas en los datos de tu zona. ` +
           `¿Sobre qué te gustaría saber?`;
  }
  
  // Default response
  return `Entiendo tu pregunta sobre "${userMessage}". ` +
         `En ${context.zone}, puedo ayudarte con información sobre calidad del aire, reciclaje, agua, energía, ` +
         `espacios verdes y otros aspectos ambientales. También puedo darte recomendaciones específicas para reducir tu impacto ecológico. ` +
         `¿Sobre qué tema específico te gustaría saber más?`;
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    backgroundColor: '#556B2F',
    padding: 20,
    paddingTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a2a',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#CCCCCC',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 12,
    borderRadius: 20,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#555',
    opacity: 0.5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});


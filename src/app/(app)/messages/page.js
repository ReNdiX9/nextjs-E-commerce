"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, User, Clock, Package, Search, Filter, Trash2, SortAsc, SortDesc, X } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    import('@/lib/firebase').then(async ({ auth, signInAnonymously }) => {
      try {
        if (auth.currentUser === null) {
          // Try to sign in anonymously, but don't fail if it's not enabled
          await signInAnonymously(auth);
        }
        setFirebaseReady(true);
      } catch (err) {
        console.warn('Firebase auth failed (this is OK if Anonymous auth is disabled):', err.message);
        // Still mark as ready - permissive Firestore rules allow unauthenticated access
        setFirebaseReady(true);
      }
    });
  }, [isLoaded, user]);

  useEffect(() => {
    if (!user || !firebaseReady) return;

    // Get all messages where current user is either sender or recipient
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      // Group messages by conversation (sender-recipient pairs)
      const conversationMap = new Map();

      
      messagesData.forEach(message => {
        if (message.senderId === user.id || message.recipientId === user.id) {
          // Create a conversation key
          const otherUserId = message.senderId === user.id ? message.recipientId : message.senderId;
          const otherUserName = message.senderId === user.id ? message.recipientName : message.senderName;
          const conversationKey = otherUserId;

          if (!conversationMap.has(conversationKey)) {
            conversationMap.set(conversationKey, {
              otherUserId,
              otherUserName,
              lastMessage: message,
              messageCount: 0,
              unreadCount: 0
            });
          }

          const conversation = conversationMap.get(conversationKey);
          conversation.messageCount++;
          
          // Check if message is unread (sent by other user and not read)
          if (message.senderId !== user.id) {
            conversation.unreadCount++;
          }

          // Keep the most recent message
          if (message.timestamp > conversation.lastMessage.timestamp) {
            conversation.lastMessage = message;
          }
        }
      });

      // Convert to array and sort by last message time
      const conversationsList = Array.from(conversationMap.values())
        .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

      setConversations(conversationsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firebaseReady]);

  // Filter and sort conversations
  useEffect(() => {
    let filtered = [...conversations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = b.lastMessage.timestamp - a.lastMessage.timestamp;
          break;
        case 'name':
          comparison = a.otherUserName.localeCompare(b.otherUserName);
          break;
        case 'messageCount':
          comparison = b.messageCount - a.messageCount;
          break;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    setFilteredConversations(filtered);
  }, [conversations, searchTerm, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Your conversation inbox
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2"
              >
                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                {sortBy === 'timestamp' ? 'Date' : sortBy === 'name' ? 'Name' : 'Messages'}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t flex gap-2 flex-wrap">
              <Button
                variant={sortBy === 'timestamp' ? 'default' : 'outline'}
                onClick={() => setSortBy('timestamp')}
                size="sm"
              >
                Date
              </Button>
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                onClick={() => setSortBy('name')}
                size="sm"
              >
                Name
              </Button>
              <Button
                variant={sortBy === 'messageCount' ? 'default' : 'outline'}
                onClick={() => setSortBy('messageCount')}
                size="sm"
              >
                Message Count
              </Button>
            </div>
          )}
        </Card>

        {/* Conversations List */}
        <div className="space-y-4">
          {filteredConversations.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No conversations yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No conversations match your search.' : 'Start chatting with sellers to see your conversations here.'}
              </p>
            </Card>
          ) : (
            filteredConversations.map((conversation) => (
              <Link
                key={conversation.otherUserId}
                href={`/chat?user=${conversation.otherUserId}`}
                className="block"
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {conversation.otherUserName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {conversation.lastMessage.timestamp.toLocaleDateString()}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                        {conversation.lastMessage.text}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {conversation.messageCount} messages
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-semibold">
                            {conversation.unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


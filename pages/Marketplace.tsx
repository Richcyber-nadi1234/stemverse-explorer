
import React, { useState } from 'react';
import { Search, Star, ShoppingCart, Filter, User, BookOpen, Video, Check, Plus, DollarSign, Package, ArrowLeft, Wallet, Tag, X } from 'lucide-react';
import { MarketplaceItem } from '../types';

const initialItems: MarketplaceItem[] = [
  {
    id: 'm1',
    title: 'Advanced Algebra Workbook',
    creator_name: 'MathWhiz_Kid',
    price: 50,
    rating: 4.8,
    reviews: 24,
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
    type: 'worksheet'
  },
  {
    id: 'm2',
    title: '1-on-1 Python Tutoring (1hr)',
    creator_name: 'CodeMaster12',
    price: 200,
    rating: 5.0,
    reviews: 12,
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=400',
    type: 'tutor_session'
  },
  {
    id: 'm3',
    title: 'Solar System 3D Models',
    creator_name: 'SpaceExplorer',
    price: 100,
    rating: 4.5,
    reviews: 8,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
    type: 'course'
  },
  {
    id: 'm4',
    title: 'Physics Exam Cheat Sheet',
    creator_name: 'NewtonJunior',
    price: 25,
    rating: 4.2,
    reviews: 150,
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=400',
    type: 'worksheet'
  }
];

export const Marketplace: React.FC = () => {
  const [view, setView] = useState<'browse' | 'purchases' | 'creator'>('browse');
  const [balance, setBalance] = useState(450);
  const [items, setItems] = useState<MarketplaceItem[]>(initialItems);
  const [purchasedItems, setPurchasedItems] = useState<MarketplaceItem[]>([]);
  const [myListings, setMyListings] = useState<MarketplaceItem[]>([]);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tutor_session' | 'content'>('all');

  // Creator Form State
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [newListing, setNewListing] = useState<Partial<MarketplaceItem>>({ type: 'worksheet' });

  // --- Actions ---

  const handleBuy = (item: MarketplaceItem) => {
    if (purchasedItems.find(i => i.id === item.id)) {
        alert('You already own this item!');
        return;
    }
    if (balance >= item.price) {
      if (window.confirm(`Purchase "${item.title}" for 🪙${item.price}?`)) {
        setBalance(prev => prev - item.price);
        setPurchasedItems(prev => [item, ...prev]);
        alert('Purchase successful! Content is now in your library.');
      }
    } else {
      alert('Insufficient funds!');
    }
  };

  const handleCreateListing = () => {
      if (!newListing.title || !newListing.price) return;
      
      const newItem: MarketplaceItem = {
          id: `own_${Date.now()}`,
          title: newListing.title,
          price: Number(newListing.price),
          type: newListing.type as any,
          creator_name: 'You',
          rating: 0,
          reviews: 0,
          thumbnail: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400' // Default placeholder
      };

      setMyListings(prev => [newItem, ...prev]);
      setItems(prev => [newItem, ...prev]); // Add to public market too for demo
      setIsListingModalOpen(false);
      setNewListing({ type: 'worksheet', title: '', price: 0 });
  };

  const filteredItems = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.creator_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' 
        ? true 
        : filterType === 'tutor_session' 
            ? item.type === 'tutor_session' 
            : item.type !== 'tutor_session'; // 'content' covers courses/worksheets
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 relative">
      
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg transition-all">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                  {view === 'browse' && (
                      <>
                        <h1 className="text-3xl font-bold mb-2">Youth Creator Marketplace</h1>
                        <p className="text-indigo-100 text-lg">Buy and sell study resources, tutoring sessions, and projects.</p>
                      </>
                  )}
                  {view === 'purchases' && (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => setView('browse')} className="hover:bg-white/20 p-1 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                            <h1 className="text-3xl font-bold">My Purchases</h1>
                        </div>
                        <p className="text-indigo-100 text-lg">Access your learning materials and scheduled sessions.</p>
                      </>
                  )}
                  {view === 'creator' && (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => setView('browse')} className="hover:bg-white/20 p-1 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
                        </div>
                        <p className="text-indigo-100 text-lg">Manage your listings and view your earnings.</p>
                      </>
                  )}
              </div>
              
              <div className="flex flex-col items-end gap-4">
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 min-w-[160px]">
                      <p className="text-xs uppercase tracking-wider font-bold text-indigo-200 mb-1">Your Balance</p>
                      <p className="text-3xl font-bold flex items-center gap-2">
                          <span className="text-yellow-400 text-2xl">🪙</span> {balance}
                      </p>
                  </div>
                  
                  {/* View Switcher Navigation */}
                  <div className="flex gap-3">
                      {view !== 'creator' && (
                          <button 
                            onClick={() => setView('creator')} 
                            className="bg-white text-indigo-600 px-5 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors shadow-md"
                          >
                              Become a Creator
                          </button>
                      )}
                      {view !== 'purchases' && (
                          <button 
                            onClick={() => setView('purchases')}
                            className="bg-indigo-800 text-white px-5 py-2 rounded-lg font-bold text-sm border border-indigo-500 hover:bg-indigo-700 transition-colors shadow-md"
                          >
                              My Purchases
                          </button>
                      )}
                      {view !== 'browse' && (
                          <button 
                            onClick={() => setView('browse')}
                            className="bg-indigo-800 text-white px-5 py-2 rounded-lg font-bold text-sm border border-indigo-500 hover:bg-indigo-700 transition-colors shadow-md"
                          >
                              Browse Market
                          </button>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* --- BROWSE VIEW --- */}
      {view === 'browse' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="relative w-full sm:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for tutors, worksheets, or courses..." 
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    <div className="flex items-center px-3 text-slate-400 border-r border-slate-200 mr-2">
                        <Filter className="w-4 h-4" />
                    </div>
                    <button 
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilterType('tutor_session')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterType === 'tutor_session' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                        Tutoring
                    </button>
                    <button 
                        onClick={() => setFilterType('content')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterType === 'content' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                        Resources
                    </button>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>No items found matching your search.</p>
                    </div>
                ) : filteredItems.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
                        <div className="relative h-48 overflow-hidden bg-slate-100">
                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-sm">
                                {item.type === 'tutor_session' && <Video className="w-3 h-3 text-indigo-600" />}
                                {item.type === 'worksheet' && <BookOpen className="w-3 h-3 text-emerald-600" />}
                                {item.type === 'course' && <BookOpen className="w-3 h-3 text-blue-600" />}
                                <span className="capitalize">{item.type.replace('_', ' ')}</span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight flex-1 mr-2">{item.title}</h3>
                                <div className="flex items-center bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded text-amber-700 text-[10px] font-bold shrink-0">
                                    <Star className="w-3 h-3 mr-1 fill-amber-500" /> {item.rating || 'New'}
                                </div>
                            </div>
                            
                            <div className="flex items-center text-slate-500 text-xs mb-4">
                                <User className="w-3 h-3 mr-1.5" />
                                by {item.creator_name}
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="font-bold text-indigo-600 text-lg">
                                    🪙 {item.price}
                                </div>
                                {purchasedItems.find(i => i.id === item.id) ? (
                                    <button disabled className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center">
                                        <Check className="w-3 h-3 mr-1" /> Owned
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleBuy(item)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-slate-200 active:scale-95"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* --- PURCHASES VIEW --- */}
      {view === 'purchases' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              {purchasedItems.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
                      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300">
                          <ShoppingBag className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No purchases yet</h3>
                      <p className="text-slate-500 mb-6">Explore the marketplace to find great learning resources.</p>
                      <button 
                        onClick={() => setView('browse')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                      >
                          Start Browsing
                      </button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {purchasedItems.map(item => (
                          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 items-center">
                              <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                                  <p className="text-xs text-slate-500 mb-2 capitalize">{item.type.replace('_', ' ')}</p>
                                  <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors w-fit">
                                      Download / Access
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* --- CREATOR DASHBOARD VIEW --- */}
      {view === 'creator' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                          <h4 className="text-slate-500 font-bold text-xs uppercase">Total Earnings</h4>
                          <DollarSign className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-3xl font-bold text-slate-900">🪙 1,250</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                          <h4 className="text-slate-500 font-bold text-xs uppercase">Active Listings</h4>
                          <Tag className="w-5 h-5 text-indigo-500" />
                      </div>
                      <p className="text-3xl font-bold text-slate-900">{myListings.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors group" onClick={() => setIsListingModalOpen(true)}>
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <Plus className="w-6 h-6" />
                          </div>
                          <span className="font-bold text-indigo-900">Create New Listing</span>
                      </div>
                  </div>
              </div>

              {/* Listings Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">My Listings</h3>
                  </div>
                  
                  {myListings.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                          <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>You haven't created any listings yet.</p>
                          <button onClick={() => setIsListingModalOpen(true)} className="text-indigo-600 font-bold text-sm mt-2 hover:underline">Create your first item</button>
                      </div>
                  ) : (
                      <table className="min-w-full text-left text-sm">
                          <thead className="bg-white border-b border-slate-100 text-slate-500">
                              <tr>
                                  <th className="px-6 py-3 font-medium">Item</th>
                                  <th className="px-6 py-3 font-medium">Type</th>
                                  <th className="px-6 py-3 font-medium">Price</th>
                                  <th className="px-6 py-3 font-medium">Sales</th>
                                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {myListings.map(item => (
                                  <tr key={item.id} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                                      <td className="px-6 py-4 capitalize">{item.type.replace('_', ' ')}</td>
                                      <td className="px-6 py-4">🪙 {item.price}</td>
                                      <td className="px-6 py-4 text-slate-500">0</td>
                                      <td className="px-6 py-4 text-right">
                                          <button className="text-slate-400 hover:text-indigo-600 font-medium">Edit</button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
              </div>
          </div>
      )}

      {/* --- CREATE LISTING MODAL --- */}
      {isListingModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900">Create New Listing</h3>
                      <button onClick={() => setIsListingModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                          <input 
                            type="text"
                            value={newListing.title || ''}
                            onChange={e => setNewListing({...newListing, title: e.target.value})}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Math Worksheet"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                              <select 
                                value={newListing.type}
                                onChange={e => setNewListing({...newListing, type: e.target.value as any})}
                                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                              >
                                  <option value="worksheet">Worksheet</option>
                                  <option value="course">Course</option>
                                  <option value="tutor_session">Tutoring Session</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (Coins)</label>
                              <input 
                                type="number"
                                value={newListing.price || ''}
                                onChange={e => setNewListing({...newListing, price: Number(e.target.value)})}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="50"
                              />
                          </div>
                      </div>
                      <button 
                        onClick={handleCreateListing}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-2"
                      >
                          Publish Listing
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

// Missing icon import shim if needed
const ShoppingBag = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

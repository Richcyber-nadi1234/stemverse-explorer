import React, { useState } from 'react';
import { Search, Star, ShoppingCart, Filter, User, BookOpen, Video, Check } from 'lucide-react';
import { MarketplaceItem } from '../types';

const mockItems: MarketplaceItem[] = [
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
  const [balance, setBalance] = useState(450);

  const handleBuy = (price: number) => {
    if (balance >= price) {
      if (window.confirm('Purchase this item?')) {
        setBalance(prev => prev - price);
        alert('Purchase successful! Content is now in your library.');
      }
    } else {
      alert('Insufficient funds!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                  <h1 className="text-3xl font-bold mb-2">Youth Creator Marketplace</h1>
                  <p className="text-indigo-100 text-lg">Buy and sell study resources, tutoring sessions, and projects.</p>
                  <div className="mt-4 flex gap-4">
                      <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors">
                          Become a Creator
                      </button>
                      <button className="bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-sm border border-indigo-500 hover:bg-indigo-600 transition-colors">
                          My Purchases
                      </button>
                  </div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                  <p className="text-xs uppercase tracking-wider font-bold text-indigo-200 mb-1">Your Balance</p>
                  <p className="text-3xl font-bold flex items-center gap-2">
                      <span className="text-yellow-400 text-2xl">🪙</span> {balance}
                  </p>
              </div>
          </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for tutors, worksheets, or courses..." 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
                  <Filter className="w-4 h-4 mr-2" /> Filters
              </button>
              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium shadow-sm">All</button>
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Tutoring</button>
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Resources</button>
          </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                  <div className="relative h-48 overflow-hidden">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-800 flex items-center gap-1">
                          {item.type === 'tutor_session' && <Video className="w-3 h-3" />}
                          {item.type === 'worksheet' && <BookOpen className="w-3 h-3" />}
                          {item.type === 'course' && <BookOpen className="w-3 h-3" />}
                          <span className="capitalize">{item.type.replace('_', ' ')}</span>
                      </div>
                  </div>
                  <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 line-clamp-2 flex-1 mr-2">{item.title}</h3>
                          <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700 text-xs font-bold">
                              <Star className="w-3 h-3 mr-1 fill-yellow-500" /> {item.rating}
                          </div>
                      </div>
                      
                      <div className="flex items-center text-slate-500 text-xs mb-4">
                          <User className="w-3 h-3 mr-1" />
                          by {item.creator_name}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="font-bold text-indigo-600 text-lg">
                              🪙 {item.price}
                          </div>
                          <button 
                            onClick={() => handleBuy(item.price)}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg transition-colors"
                          >
                              <ShoppingCart className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};
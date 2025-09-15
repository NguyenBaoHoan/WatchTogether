import React from 'react';
import { Play, Users, MessageCircle, List, Camera, CheckCircle } from 'lucide-react';

const App  = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="%23111827"/><g opacity="0.4"><rect x="100" y="200" width="200" height="300" fill="%23f59e0b" rx="8"/><rect x="350" y="150" width="150" height="200" fill="%23f59e0b" rx="8"/><rect x="550" y="250" width="180" height="250" fill="%23f59e0b" rx="8"/><rect x="1200" y="180" width="160" height="220" fill="%23f59e0b" rx="8"/><rect x="1400" y="120" width="140" height="180" fill="%23f59e0b" rx="8"/><rect x="1580" y="200" width="120" height="160" fill="%23f59e0b" rx="8"/></g></svg>')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
            <Play className="w-5 h-5 text-black" fill="currentColor" />
          </div>
          <span className="text-xl font-bold">Watch2Gether</span>
        </div>

        <div className="flex items-center space-x-6">
          <a href="#" className="hover:text-yellow-500 transition-colors">🏠</a>
          <a href="#" className="hover:text-yellow-500 transition-colors">Community</a>
          <a href="#" className="text-yellow-500 hover:text-yellow-400 transition-colors">Upgrade</a>
          <a href="#" className="hover:text-yellow-500 transition-colors">Sign up</a>
          <a href="#" className="hover:text-yellow-500 transition-colors">Log in</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-4">
        <h1 className="text-6xl md:text-7xl font-light mb-8 text-center">
          spend time<span className="text-yellow-500">|</span>together.
        </h1>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 mb-4">
          Create your room
        </button>

        <p className="text-gray-400 mb-8">(No user account required)</p>

        {/* Platform Icons */}
        <div className="flex space-x-6 mb-16">
          <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
            <Play className="w-6 h-6" fill="currentColor" />
          </div>
          <div className="w-12 h-12 bg-purple-600 rounded flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
            <div className="w-6 h-6 bg-current rounded" />
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
            <div className="w-6 h-6 bg-current rounded-full" />
          </div>
          <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
            <div className="w-6 h-6 bg-current rounded" />
          </div>
          <div className="w-12 h-12 bg-black rounded flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
            <div className="w-6 h-6 bg-current rounded-full" />
          </div>
          <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
            <Camera className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-8">About Watch2Gether</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                With Watch2Gether you can watch YouTube together. Services like
                Vimeo, Netflix, Amazon, Disney & Co are also supported. Create a room
                and invite friends to your WatchParty.
              </p>

              <p className="text-gray-300 leading-relaxed">
                With Watch2Gether you can easily host a watch party and watch YouTube videos with friends. Other services such as
                Vimeo, Netflix, Amazon, Disney & Co are also supported. Create a room, share the link and you're ready to go. All videos
                run synchronously and you can talk to each other using the built-in chat. Have fun with Watch2Gether!
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Synchronized player for video and audio</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Talk to your friends in the integrated chat room</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Enjoy content from YouTube, Vimeo, Dailymotion and SoundCloud</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Organize content into playlists</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Webcam support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gray-700 rounded-lg p-6 mb-4 relative">
              <div className="text-4xl font-bold text-yellow-500 mb-2">1.</div>
              <h3 className="text-xl font-semibold mb-2">Create a room</h3>
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 text-yellow-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gray-700 rounded-lg p-6 mb-4 relative">
              <div className="text-4xl font-bold text-yellow-500 mb-2">2.</div>
              <h3 className="text-xl font-semibold mb-2">Share the link</h3>
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 text-yellow-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gray-700 rounded-lg p-6 mb-4">
              <div className="text-4xl font-bold text-yellow-500 mb-2">3.</div>
              <h3 className="text-xl font-semibold mb-2">Watch2Gether</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gray-800 bg-opacity-60 rounded-lg p-6">
            <p className="text-gray-300 mb-4">
              "I just wanted to say that Watch2Gether is absolutely wonderful, me and my girlfriend are in a long-distance relationship and we use it all the time."
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">- Ted by Email</span>
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-60 rounded-lg p-6">
            <p className="text-gray-300 mb-4">
              "I think teachers would be really interested in this site as it allows students to watch videos and comment on them."
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">- Lynn by Email</span>
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-60 rounded-lg p-6">
            <p className="text-gray-300 mb-4">
              "My friends and I love Watch2Gether. We don't live near each other any more, but now we get to continue our tradition of watching videos together every day. We've used Watch2Gether since it first launched and there's no reason why we would ever stop using it!"
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">- David on Facebook</span>
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-60 rounded-lg p-6">
            <p className="text-gray-300 mb-4">
              "The Watch2Gether website is the best thing ever :-) it's the first of its kind to help with online RPG games. We mostly use Watch2Gether for background music and sound effects."
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">- Anton on Facebook</span>
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700 bg-gray-900 bg-opacity-90">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-wrap justify-between items-center">
            <div className="space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Product documentation</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact - Site notice / Impressum</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy settings</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Data Privacy Policy</a>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded">
              <span className="text-sm">🇺🇸</span>
              <span className="text-sm">🔽</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
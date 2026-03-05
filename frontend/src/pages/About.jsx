import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ShoppingBag, Users, Globe, Award, ArrowLeft } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, value: '10M+', label: 'Active Users' },
    { icon: ShoppingBag, value: '50M+', label: 'Items Listed' },
    { icon: Globe, value: '190+', label: 'Countries' },
    { icon: Award, value: '4.8/5', label: 'Customer Rating' }
  ];

  const values = [
    {
      title: 'Trust & Safety',
      description: 'We prioritize secure transactions and protect both buyers and sellers with advanced fraud detection and buyer protection programs.',
      icon: '🛡️'
    },
    {
      title: 'Innovation',
      description: 'Constantly evolving our platform with cutting-edge technology to provide the best marketplace experience.',
      icon: '💡'
    },
    {
      title: 'Community First',
      description: 'Building a vibrant community where buyers and sellers connect, share, and grow together.',
      icon: '🤝'
    },
    {
      title: 'Sustainability',
      description: 'Promoting circular economy through pre-owned items, reducing waste, and supporting eco-friendly practices.',
      icon: '🌱'
    }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: '15+ years in e-commerce and marketplace platforms',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Former tech lead at major tech companies',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    },
    {
      name: 'Emily Johnson',
      role: 'Head of Product',
      bio: 'Product expert with passion for user experience',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
    },
    {
      name: 'David Kim',
      role: 'Head of Trust & Safety',
      bio: 'Cybersecurity specialist ensuring platform security',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-5xl font-bold mb-6">About Effinsure</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            We're on a mission to create the world's most trusted and innovative marketplace 
            where anyone can buy and sell virtually anything.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </div>
                  <stat.icon className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Effinsure was founded in 2020 with a simple idea: create a marketplace that puts 
                trust, innovation, and community at its core. What started as a small platform has 
                grown into a global marketplace serving millions of users worldwide.
              </p>
              <p>
                We believe that commerce should be accessible to everyone, whether you're a casual 
                seller clearing out your closet or a professional merchant building your business. 
                Our platform provides the tools, security, and reach you need to succeed.
              </p>
              <p>
                Today, we're proud to be one of the fastest-growing marketplaces, connecting buyers 
                and sellers across 190+ countries, with billions of dollars in transactions annually.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800" 
              alt="Team collaboration"
              className="rounded-lg shadow-lg w-full h-64 object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800" 
              alt="Office environment"
              className="rounded-lg shadow-lg w-full h-64 object-cover mt-8"
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index}>
                <CardContent className="pt-6 text-center">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Leadership Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-blue-600 mb-2">{member.role}</p>
                <p className="text-xs text-gray-600">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether you're buying or selling, Effinsure is the place for you.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/sell')} className="bg-white text-blue-600 hover:bg-gray-100">
              Start Selling
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/')} className="border-white text-white hover:bg-white/10">
              Browse Items
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
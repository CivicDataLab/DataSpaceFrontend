import React from 'react';
import Image from 'next/image';
import { Text } from 'opub-ui';

const Team = () => {
  const team = [
  
    {
      name: 'Deepthi Chand',
      role: 'Technology Director',
      image: '/team/dc.jpg',
    },
    {
      name: 'Gaurav Godhwani',
      role: 'Executive Director',
      image: '/team/gaurav.jpg',
    },
    {
      name: 'Nupura Gawde',
      role: 'Initiative Lead',
      image: '/team/nupura.jpeg',
    },
    {
      name: 'Saurabh Levin',
      role: 'Associate Data Lead',
      image: '/team/saurabh.jpg',
    },
    {
      name: 'Abhinandita',
      role: 'Senior Product Designer',
      image: '/team/abhinandita.jpg',
    },
    {
      name: 'Aparna',
      role: 'Product Designer',
      image: '/team/aparna.jpg',
    },
    {
      name: 'Sanjay',
      role: 'Frontend Engineer',
      image: '/team/sanjay.jpg',
    },
    {
      name: 'Saqib Manan',
      role: 'Quality Assurance Engineer',
      image: '/team/saqib.jpg',
    },
    {
      name: 'Bhavabhuthi',
      role: 'Senior Frontend Engineer',
      image: '/team/bhavabhuthi.jpeg',
    },
    {
      name: 'Prajna',
      role: 'Data Engineer',
      image: '/team/prajna.jpg',
    },
   
  ];
  return (
    <div className="py-5 lg:py-10">
      <div className="flex flex-wrap gap-6">
        {team.map((member) => (
          <div
            key={member.name}
            className="flex flex-col gap-4 p-6 shadow-card rounded-2"
          >
            <Image
              src={member.image}
              alt={member.name}
              width={220}
              height={220}
              className=" object-cover"
            />
            <div className="flex flex-col gap-2">
              <Text variant="headingLg">{member.name}</Text>
              <Text variant="bodyMd">{member.role}</Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;

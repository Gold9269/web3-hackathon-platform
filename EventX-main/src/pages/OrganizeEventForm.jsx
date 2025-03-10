import React from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewHackathon } from '../store/contractSlice';
import { ethers } from 'ethers';

const OrganizeEventForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();

  const onSubmit = (data) => {
    try {
      dispatch(createNewHackathon({
        name: data.name,
        description: data.description,
        prizePool: ethers.utils.parseEther(data.prizePool.toString()),
        firstPrizePercent: Number(data.firstPrizePercent),
        secondPrizePercent: Number(data.secondPrizePercent),
        thirdPrizePercent: Number(data.thirdPrizePercent),
        maxTeamSize: Number(data.maxTeamSize),
        maxTeams: 999999,
        startDate: Math.floor(Date.now() / 1000),
        endDate: Math.floor(new Date(data.endDate).getTime() / 1000),
        roundTotal: Number(data.roundTotal),
        roundAt: data.roundAt,
      }));
    } catch (err) {
      console.error("Error submitting form:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-8">
          <button className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Organize an Event</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="text" placeholder="Event Name" {...register('name', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.name && <p className="text-red-500 text-sm">Event name is required</p>}

          <textarea placeholder="Description" {...register('description', { required: true })} className="block w-full border-gray-300 rounded-md p-2"></textarea>
          {errors.description && <p className="text-red-500 text-sm">Description is required</p>}

          <input type="number" placeholder="Prize Pool" {...register('prizePool', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.prizePool && <p className="text-red-500 text-sm">Prize pool is required</p>}

          <input type="number" placeholder="First Prize (%)" {...register('firstPrizePercent', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          <input type="number" placeholder="Second Prize (%)" {...register('secondPrizePercent', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          <input type="number" placeholder="Third Prize (%)" {...register('thirdPrizePercent', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />

          <input type="number" placeholder="Max Team Size" {...register('maxTeamSize', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.maxTeamSize && <p className="text-red-500 text-sm">Max team size is required</p>}

          <input type="date" {...register('endDate', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.endDate && <p className="text-red-500 text-sm">End date is required</p>}

          <input type="number" placeholder="Total Rounds" {...register('roundTotal', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.roundTotal && <p className="text-red-500 text-sm">Total rounds are required</p>}

          <input type="text" placeholder="Round At" {...register('roundAt', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.roundAt && <p className="text-red-500 text-sm">Round at is required</p>}

          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrganizeEventForm;
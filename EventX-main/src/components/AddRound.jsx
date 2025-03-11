import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import organizeService from '../backend/organize'
import { ArrowLeft, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';


function AddRound() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { id } = useParams();
    const navigate = useNavigate()


    const onSubmit = async (data) => {
    
        try{
          const response = await organizeService.addRound(id,data)
          if (response.success) {
            alert("Round created successfully!");
            navigate(`/hackathon/${id}`)
        }
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
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Add Round</h2>
        <form onSubmit={handleSubmit(onSubmit)} name="banner" className="space-y-6">

          <input type="text" placeholder="Round Name" {...register('roundName', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.name && <p className="text-red-500 text-sm">Round name is required</p>}

          <input placeholder="Round Type" type="text" {...register('roundType', { required: true })} className="block w-full border-gray-300 rounded-md p-2"/>
          {errors.description && <p className="text-red-500 text-sm">Round Type is required</p>}

          <input type="text" placeholder="Judging Criteria" {...register('judgingCriteria', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.maxTeamSize && <p className="text-red-500 text-sm">Jusging Criteria is required</p>}

          <input type="date" {...register('startDate', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.endDate && <p className="text-red-500 text-sm">Start Date is required</p>}
          
          <input type="date" {...register('endDate', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.endDate && <p className="text-red-500 text-sm">End date is required</p>}


          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full">
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddRound
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createNewHackathon } from '../store/contractSlice';
import { useNavigate } from "react-router-dom";
import organizeService from '../backend/organize.js';
import { Particles } from "./magicui/particles";
import { toast } from 'react-hot-toast';

const OrganizeEventForm = () => {
  const navigate = useNavigate();
  const [bannerFile, setBannerFile] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();

  const handleFileChange = (event) => {
    setBannerFile(event.target.files[0]);
  };


  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Creating hackathon...");
    try {
      console.log("Form data received:", data);
      
            // Convert date inputs
            const currentTimestamp = Math.floor(Date.now() / 1000);
            let startDate = Math.floor(new Date(`${data.startDate}T00:00:00Z`).getTime() / 1000);
            let endDate = Math.floor(new Date(`${data.endDate}T00:00:00Z`).getTime() / 1000);
      
            if (!startDate || startDate <= currentTimestamp) {
              startDate = currentTimestamp + 300; // Default to 5 minutes in the future
            }
            if (!endDate || endDate <= startDate) {
              throw new Error("End date must be after start date.");
            }
      
            // Dispatch Redux action to create the hackathon
            const result = await dispatch(createNewHackathon({
              name: data.name,
              description: data.description,
              prizePool: data.prizePool.toString(),
              firstPrizePercent: Number(data.firstPrizePercent),
              secondPrizePercent: Number(data.secondPrizePercent),
              thirdPrizePercent: Number(data.thirdPrizePercent),
              maxTeamSize: Number(data.maxTeamSize),
              maxTeams: 999999,
              startDate,
              endDate,
              roundTotal: Number(data.roundTotal),
              roundAt: data.roundAt,
            })).unwrap();
      
            console.log("Hackathon created:", result);
            toast.success("Hackathon created successfully!");
            console.log(bannerFile);
            
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("finaleDate", data.endDate);
            formData.append("prizePool", data.prizePool);
            formData.append("maxTeamSize", data.maxTeamSize);
            formData.append("roundTotal", data.roundTotal);
            formData.append("votingOpen", data.isVoteActive);
            formData.append("banner", bannerFile);

            for (let pair of formData.entries()) {
              console.log(pair[0] + ": " + pair[1]);
          }
          
            

      const response = await organizeService.createHackathon(formData)
      if (response.success) {
        alert("Hackathon created successfully!");
        navigate("/")
    }
    } catch (err) {
          console.error("Error creating hackathon:", err);
          toast.error(`Error: ${err.message || "Something went wrong"}`);
        } finally {
          toast.dismiss(loadingToast);
        }
  };

  return (
    <div className= "min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="fixed w-full h-full inset-0 z-0">
      <Particles
           quantity={100}
           staticity={30}
           ease={50}
          size={2}
           refresh={false}
           color={"#0A0A08"}
           vx={0.5}
           vy={0.5}
         />
       </div>
      <div className=" relative max-w-4xl mx-auto bg-white/90 p-8 rounded-2xl  backdrop-blur-md border border-gray-200  shadow-md">
        <div className="flex items-center mb-8">
          <button className="flex items-center text-gray-600 hover:text-gray-900" onClick={()=>navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Organize an Event</h2>
        <form onSubmit={handleSubmit(onSubmit)} name="banner" className="space-y-6">
          <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Event Banner</label>
               <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                 <div className="space-y-1 text-center">
                   <Upload className="mx-auto h-12 w-12 text-gray-400" />
                   <label className="cursor-pointer text-blue-600 font-medium hover:text-blue-500">
                     {bannerFile?<span>{bannerFile.name}</span>:<span>Click here to upload</span>}
                     <input onChange={handleFileChange} type="file" className="sr-only"/>
                   </label>
                   <p className="text-xs text-gray-500">Max size of image cannot exceed 1MB!</p>
                 </div>
               </div>
              {errors.banner && <p className="mt-2 text-sm text-red-600">Banner is required</p>}
             </div>
          <input type="text" placeholder="Event Name" {...register('name', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.name && <p className="text-red-500 text-sm">Event name is required</p>}

          <textarea placeholder="Description" {...register('description', { required: true })} className="block w-full border-gray-300 rounded-md p-2"></textarea>
          {errors.description && <p className="text-red-500 text-sm">Description is required</p>}

          <input type="number" placeholder="Prize Pool" {...register('prizePool', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.prizePool && <p className="text-red-500 text-sm">Prize pool is required</p>}

         {/* Prize Percentages */}
         {["First", "Second", "Third"].map((prize, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{prize} Prize (%)</label>
              <input type="number" placeholder={`${prize} Prize (%)`} {...register(`${prize.toLowerCase()}PrizePercent`, { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
            </div>
          ))}
          <input type="number" placeholder="Max Team Size" {...register('maxTeamSize', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.maxTeamSize && <p className="text-red-500 text-sm">Max team size is required</p>}

          {["Start", "End"].map((type, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{type} Date</label>
              <input type="date" {...register(`${type.toLowerCase()}Date`, { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
              {errors[`${type.toLowerCase()}Date`] && <p className="text-red-500 text-sm">{type} date is required</p>}
            </div>
          ))}
          <input type="number" placeholder="Total Rounds" {...register('roundTotal', { required: true })} className="block w-full border-gray-300 rounded-md p-2" />
          {errors.roundTotal && <p className="text-red-500 text-sm">Total rounds are required</p>}

          <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Is Vote Active?</label>
               <select
                 {...register("isVoteActive", { required: true })}
                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
               >
                 <option value="true">True</option>
                 <option value="false">False</option>
               </select>
               {errors.isVoteActive && (
                 <p className="mt-2 text-sm text-red-600">Vote status is required</p>
               )}
             </div>

          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrganizeEventForm;







































































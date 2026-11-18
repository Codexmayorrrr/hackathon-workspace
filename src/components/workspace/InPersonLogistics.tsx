import React from 'react';
import { 
  MapPin, 
  Luggage, 
  Calendar, 
  Phone, 
  Check, 
  ExternalLink
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface InPersonLogisticsProps {
  workspaceId: string;
  opportunityTitle?: string;
}

export const InPersonLogistics: React.FC<InPersonLogisticsProps> = ({
  workspaceId,
}) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(workspaceId));
  const toggleLogisticsItemPacked = useWorkspaceStore((state) => state.toggleLogisticsItemPacked);

  const logistics = workspace?.logistics;

  if (!logistics) {
    return (
      <div className="p-8 rounded-2xl bg-[#FDFDFD] text-center space-y-2">
        <p className="text-sm font-semibold text-neutral-900">Online Hackathon</p>
        <p className="text-xs text-neutral-500">This event does not require in-person travel or packing logistics.</p>
      </div>
    );
  }

  const packedCount = logistics.packingList.filter((i) => i.packed).length;
  const totalItems = logistics.packingList.length;

  return (
    <div className="space-y-6">
      {/* Venue & Transportation Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-neutral-800 flex-shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Venue & Location
              </span>
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 [text-wrap:balance]">
                {logistics.venueName}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 [text-wrap:pretty]">
                {logistics.venueAddress}
              </p>
              <p className="text-xs text-neutral-400 pt-1">
                Travel Note: {logistics.mapDirections}
              </p>
            </div>
          </div>

          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
            className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
          </a>
        </div>
      </div>

      {/* Grid: Packing List & Event Weekend Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Packing Checklist (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-5">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-neutral-800">
                <Luggage className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-neutral-900">
                  Hackathon Packing Checklist
                </h5>
                <p className="text-[11px] text-neutral-500">
                  Essentials verified by experienced African hackathon veterans
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-neutral-800 tabular-nums">
              {packedCount} / {totalItems} Packed
            </span>
          </div>

          <div className="space-y-2">
            {logistics.packingList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  toggleLogisticsItemPacked(workspaceId, item.id);
                  toast.success(item.packed ? `Unchecked ${item.item}` : `Packed: ${item.item}`);
                }}
                className={`p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-[transform,background-color] duration-150 active:scale-[0.98] ${
                  item.packed
                    ? 'bg-[#F5F5F5] opacity-70'
                    : 'bg-[#F5F5F5] hover:bg-[#EBEBEB]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    item.packed ? 'bg-emerald-600 text-white' : 'bg-white'
                  }`}>
                    {item.packed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${
                    item.packed ? 'text-neutral-400 line-through' : 'text-neutral-900'
                  }`}>
                    {item.item}
                  </span>
                </div>

                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-neutral-500">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule & Emergency Contacts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Schedule */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
            <div className="flex items-center gap-2.5 pb-2">
              <Calendar className="w-4 h-4 text-neutral-700 stroke-[1.75]" />
              <h5 className="text-sm font-bold text-neutral-900">
                Weekend Timeline & Milestones
              </h5>
            </div>

            <div className="space-y-3">
              {logistics.schedule.map((slot, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <span className="font-mono text-neutral-400 whitespace-nowrap pt-0.5">
                    {slot.time}
                  </span>
                  <span className="font-medium text-neutral-800 leading-snug">
                    {slot.activity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-3">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-neutral-700 stroke-[1.75]" />
              <h5 className="text-sm font-bold text-neutral-900">
                Organizer Contacts
              </h5>
            </div>

            <div className="space-y-2">
              {logistics.emergencyContacts.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#F5F5F5] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-neutral-900 block">{c.name}</span>
                    <span className="text-[11px] text-neutral-400">{c.role}</span>
                  </div>
                  <span className="font-mono text-neutral-700 bg-white px-2 py-1 rounded">
                    {c.contact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

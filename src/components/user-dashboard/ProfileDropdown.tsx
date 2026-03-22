"use client";

import { api } from '@/api/axios';
import { UserContext } from '@/contexts/UserContext';
import { Avatar, Menu, rem } from '@mantine/core'
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from 'react'
import { IoIosArrowDown } from "react-icons/io";
import { IoLogOutOutline, IoNotificationsOutline } from "react-icons/io5";
import ConfirmationModal from '../features/ConfirmationModal';
import { IAdmin } from '@/lib/models/admin.model';

type Props = {}

const ProfileDropdown: React.FC<Props> = ({ }) => {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState<number | null>(20);
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<IAdmin | null>(null);
    const { logout } = useContext(UserContext);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get("/users/userDetails");
                setUserProfile(response?.data?.user);
            } catch (error) {
                console.error("Error fetching user profile", error);
            }
        };
        fetchUserProfile();
    }, []);

    const handleConfirmLogout = async () => {
        setLoading(true);
        logout();
        router.push("/");
        setIsModalOpen(false);
        setLoading(false);
    };

    return (
        <Menu position='bottom-end' shadow='md'>
            <Menu.Target>
                <div className='flex border-[0.5px] border-[var(--bg-general-light)] items-center cursor-pointer rounded-full bg-(--bg-general-lighter) relative'>
                    {/* Avatar */}
                    <div className='mx-2'>
                        <Avatar src={'/images/profile-image.jpg'} size={32} />
                    </div>

                    {/* User Info */}
                    <div className='hidden sm:flex flex-col leading-4 text-xs rounded-3xl rounded-tr-sm rounded-bl-sm border-[0.5px] px-2 py-2 border-[var(--bg-general-light)] custom-black-white-theme-switch-text'>
                        <span className='uppercase text-[10px] md:text-xs'>
                            {userProfile ? ` ADMIN USER` : 'Loading...'}
                        </span>
                        <span className='text-[10px] md:text-xs'>
                            {userProfile ? userProfile.email : 'Loading...'}
                        </span>
                    </div>

                    {/* Dropdown Icon */}
                    <div className='mx-2 text-sm md:text-base custom-black-white-theme-switch-text'>
                        <IoIosArrowDown />
                    </div>
                </div>
            </Menu.Target>

            {/* Dropdown Menu */}
            <Menu.Dropdown>
                <Menu.Item leftSection={<IoLogOutOutline style={{ width: rem(14), height: rem(14) }} />} onClick={() => setIsModalOpen(true)}>
                    Sign Out
                </Menu.Item>
            </Menu.Dropdown>

            <ConfirmationModal
                opened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                loading={loading}
            />
        </Menu>
    )
}

export default ProfileDropdown

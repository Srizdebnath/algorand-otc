import React, { Fragment } from 'react'; // Import Fragment
import { Menu, Transition } from '@headlessui/react'; // Import Menu components
import { ChevronDownIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/20/solid';

interface HeaderProps {
  accountAddress: string | null;
  // We need to pass the disconnect function back in
  onDisconnect: () => void;
}

const AlgorandLogo = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 20.5L12 3.5L21.5 20.5H2.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M12 20.5L16.25 12.5L21.5 20.5H12Z" fill="currentColor"/>
    </svg>
);


function Header({ accountAddress, onDisconnect }: HeaderProps) {
  const isConnected = !!accountAddress;

  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between items-center border-b border-gray-700 shadow-md">
      {/* Left Side: Branding and Navigation (remains the same) */}
      <div className="flex items-center gap-x-8">
        <div className="flex items-center gap-x-3 text-cyan-400">
          <AlgorandLogo />
          <h1 className="text-2xl font-bold text-white">OTC Swap</h1>
        </div>
        <nav className="hidden md:flex items-center gap-x-6 text-gray-400">
          <a href="#" className="text-white font-semibold hover:text-cyan-400 transition-colors">Dashboard</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">My Offers</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">History</a>
        </nav>
      </div>

      {/* Right Side: User Dropdown Menu */}
      <div>
        {isConnected && (
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="flex items-center gap-x-3 bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
                <div className="w-3 h-3 bg-green-500 rounded-full" title="Connected"></div>
                <span className="font-mono text-sm text-gray-300">
                  {`${accountAddress.substring(0, 5)}...${accountAddress.substring(accountAddress.length - 5)}`}
                </span>
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onDisconnect}
                        className={`${
                          active ? 'bg-red-600 text-white' : 'text-gray-300'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                      >
                        <ArrowLeftOnRectangleIcon className="mr-2 h-5 w-5" />
                        Disconnect
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </header>
  );
}

export default Header;
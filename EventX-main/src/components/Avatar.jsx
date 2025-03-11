import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import classNames from "classnames";

const Avatar= () => {
  const user = useSelector((state) => state.auth?.user);
  const avatarSrc = user?.avatar || "https://i.sstatic.net/frlIf.png";
  const userName = user?.name || "John Doe";
  const userEmail = user?.email || "john@example.com";

 
  return (
    <div className="relative">
      <Menu as="div" className="relative">
        <div>
          <Menu.Button className="flex items-center rounded-full bg-white dark:bg-gray-900 p-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2">
            <img className="h-8 w-8 rounded-full" src={`${avatarSrc}`} alt="User Avatar" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <img className="h-10 w-10 rounded-full" src={avatarSrc} alt="User Avatar" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-2">
              <button className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600">
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
              {[
                { label: "My Lists", href: "#" },
                { label: "Settings", href: "#" },
                { label: "Sign out", href: "#" },
              ].map((item, index) => (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <a
                      href={item.href}
                      className={classNames(
                        active ? "bg-gray-100 dark:bg-gray-700" : "",
                        "block px-4 py-2 text-sm text-gray-900 dark:text-white"
                      )}
                    >
                      {item.label}
                    </a>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default Avatar;

import { UserButton, useUser } from "@clerk/react-router"
import { CircleUser } from "lucide-react";

export const CustomUserButton = () => {
  const {user} = useUser()
  return (
    <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label="Profile"
              labelIcon={<CircleUser size={16} />}
              href={`/users/${user?.id}`}
        />
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
          </UserButton.MenuItems>
        </UserButton>
  )
}
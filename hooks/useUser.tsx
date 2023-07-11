import { Subscription, UserDetails } from "@/types";
import { User } from "@supabase/auth-helpers-nextjs";
import {
  useSessionContext,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();

  //create the user context, we rename this because we are creating custom hook called useUser.
  const user = useSupaUser();

  //access the token
  const accessToken = session?.access_token ?? null;

  //setting the state
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const [subscription, setSubscription] = useState<Subscription | null>(null);

  //write actions. Fetch from database
  const getUserDetails = () => supabase.from("users").select("*").single();

  //get subscription detail action
  const getSubscription = () =>
    supabase
      .from("subscriptions")
      .select("*, prices(*, products(*))")
      .in("status", ["trialing", "active"])
      .single();

  useEffect(() => {
    //so if we are logged in, and we are not loading, and there are no details and no subscription details, then we will set loading data to true
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);

      //we want to wait until we get the user details and subscription details.
      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];

          if (userDetailsPromise.status === "fulfilled") {
            setUserDetails(userDetailsPromise.value.data as UserDetails);
          }

          if (subscriptionPromise.status === "fulfilled") {
            setSubscription(subscriptionPromise.value.data as Subscription);
          }

          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
  };

  return <UserContext.Provider value={value} {...props} />;
};

//actually create the hook
export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("user must be used within a MyUserContextProvider");
  }

  return context;
};

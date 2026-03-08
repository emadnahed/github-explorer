import { useAppSelector } from '@/store/hooks';

export function useGithubUser() {
  const currentUser = useAppSelector((state) => state.github.currentUser);
  const userLoading = useAppSelector((state) => state.github.userLoading);
  const userError = useAppSelector((state) => state.github.userError);
  const repos = useAppSelector((state) => state.github.repos);
  const reposLoading = useAppSelector((state) => state.github.reposLoading);
  const languageData = useAppSelector((state) => state.github.languageData);
  const languagesLoading = useAppSelector((state) => state.github.languagesLoading);
  const bookmarks = useAppSelector((state) => state.github.bookmarks);

  const isBookmarked = currentUser
    ? bookmarks.includes(currentUser.login.toLowerCase())
    : false;

  return {
    currentUser,
    userLoading,
    userError,
    repos,
    reposLoading,
    languageData,
    languagesLoading,
    isBookmarked,
  };
}

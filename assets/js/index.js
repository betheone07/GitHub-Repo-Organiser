const API = 'https://api.github.com';
const gitForm = document.getElementById('githubRepoForm');
const orgName = document.getElementById('org-name');
const tableBody = document.getElementById('repo-table-body');

const getReposFromGithub = async ({ organisation, numRepos }) => {
  const response = await axios.get(`${API}/orgs/${organisation}/repos`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  return response.data;
};

const getContributers = async ({ repo }) => {
  const response = await axios.get(
    `${API}/repos/${repo}/contributors?q=contributions&order=desc`,
    {
      headers: { Accept: 'application/vnd.github.v3+json' },
    }
  );
  return response.data;
};
const getContributerElement = (contributor) => {
  return `
    <div class="contributor-prof">
        <img
         src=${contributor.avatar_url}
         class="avatar"
        />
        <div class="contributor-details">
        <h4>${contributor.login}</h4>
        <h6 class="contributions">${contributor.contributions} contribution</h6>
        </div>
    </div>`;
};

const clearTable = () => {
  tableBody.innerHTML = '';
};

const setDataToUi = (repositories, organisation) => {
  clearTable();
  orgName.innerHTML = organisation;
  repositories.forEach((repo) => {
    const contributorList = repo.contributors.map((elem) => {
      return `
            <li>
                ${getContributerElement(elem)}
            </li>`;
    });

    tableBody.innerHTML += `
        <tr>
            <td>
                ${repo.repository}
            </td>
            <td>
                <ul>
                ${contributorList.join(' ')}
                </ul>
            </td>
        </tr>`;
  });
};

gitForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    organisation: gitForm['organisation'].value.trim(),
    numRepos: gitForm['n'].value,
    numContributors: gitForm['m'].value,
  };

  const repositories = (await getReposFromGithub(formData)).slice(
    0,
    formData.numRepos
  );

  const reposWithContributors = await Promise.all(
    repositories.map(async (repository, index) => {
      const payload = {
        repo: repository.full_name,
      };
      const contributors = (await getContributers(payload)).slice(
        0,
        formData.numContributors
      );

      return {
        repository: repository.full_name,
        contributors: contributors,
      };
    })
  );

  setDataToUi(reposWithContributors, formData.organisation);
});

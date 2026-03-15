window.addEventListener("load", () => {
  const POSTS_STORAGE_KEY = "monopoly-project.editorial-posts";
  const editorialPosts = document.getElementById("editorialPosts");

  if (!editorialPosts) {
    return;
  }

  const rawPosts = window.localStorage.getItem(POSTS_STORAGE_KEY);

  if (!rawPosts) {
    return;
  }

  try {
    const posts = JSON.parse(rawPosts);

    if (!Array.isArray(posts) || posts.length === 0) {
      return;
    }

    editorialPosts.innerHTML = posts
      .map(
        (post) => `
          <article class="editorial-post">
            <p class="eyebrow">Posted by @${post.author}</p>
            <h2>${post.title}</h2>
            <p class="editorial-post-excerpt">${post.excerpt}</p>
            <div class="editorial-post-body">
              <p>${post.body}</p>
            </div>
          </article>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Editorial posts storage is corrupted", error);
  }
});

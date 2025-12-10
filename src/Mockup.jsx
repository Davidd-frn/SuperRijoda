import { useEffect, useState } from "react";

function Mockup() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    fetch(
      "https://dev-super-rijoda.pantheonsite.io/wp-json/wp/v2/pages?slug=visual-mock-up-of-our-project"
    )
      .then((res) => res.json())
      .then((data) => setPage(data[0]));
  }, []);

  if (!page) return <p>Loading...</p>;

  return (
    <main>
      <section id="articles">
        <article>
          <header>
            <h2>{page.title.rendered}</h2>
            <p className="authors-inline">
              By Fournier David, Dozinel Jonathan, Murtezani Rinor
            </p>
            <br />
          </header>

          <div
            className="wp-content"
            dangerouslySetInnerHTML={{
              __html: page.content.rendered,
            }}
          />
        </article>
      </section>
    </main>
  );
}

export default Mockup;

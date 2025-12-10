import { useEffect, useState } from "react";

function Description() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    fetch(
      "https://dev-super-rijoda.pantheonsite.io/wp-json/wp/v2/pages?slug=sample-page"
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
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        </article>
      </section>

      <aside>
        <div>
          <h3>Team Info</h3>
          <ul>
            <li>
              <strong>Fournier David</strong>: Coder
            </li>
            <li>
              <strong>Dozinel Jonathan</strong>: Editor
            </li>
            <li>
              <strong>Murtezani Rinor</strong>: Designer
            </li>
          </ul>
        </div>
      </aside>
    </main>
  );
}

export default Description;

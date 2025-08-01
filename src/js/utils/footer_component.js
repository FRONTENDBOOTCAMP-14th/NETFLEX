import '../../components/footer/footer.css';

const pageLayout = document.querySelector('.page-layout');

window.addEventListener('DOMContentLoaded', () => {
  const footerComponents = `
        <footer>
        <p>
          © 2025 멋쟁이 사자처럼 프론트엔드 14기 Netflex. All rights reserved.
        </p>
        <p>바닐라 프로젝트</p>
        <p>
          <a
            href="https://github.com/FRONTENDBOOTCAMP-14th/NETFLEX"
            target="_blank"
            rel="noopener noreferrer"
            >GitHub</a
          >
          <span class="divider">|</span>
          <a
            href="https://www.notion.so/Netflex-23473873401a803d8e2fe9b300e2bafe"
            target="_blank"
            rel="noopener noreferrer"
            >Notion</a
          >
        </p>
      </footer>`;

  pageLayout.insertAdjacentHTML('beforeend', footerComponents);
});

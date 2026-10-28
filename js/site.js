/*
Copyright (C) 2004-2027 Mert Gör

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

const currentPage = new URL(window.location.href);

const navigation = document.querySelector(".site-navigation");

if (navigation) {
  const categories = [
    { title: "Profil", links: ["Hakkımda", "Sertifikalar"] },
    {
      title: "Akademik çalışmalar",
      links: [
        "Araştırma yol haritası",
        "Yüksek lisans",
        "Doktora",
        "Özgür Yazılım, Özgür Türkiye",
      ],
    },
    { title: "Site", links: ["Değişiklik geçmişi"] },
    {
      title: "Lisanslar",
      links: [
        "Lisanslar",
        "GNU AGPLv3-or-later",
        "CC BY-SA 4.0 or later",
      ],
    },
    { title: "Kaynak kodu", links: ["JavaScript kodu"] },
  ];
  const linksByTitle = new Map(
    categories.map(({ title }) => [title, []]),
  );
  const categoryByLink = new Map(
    categories.flatMap(({ title, links }) =>
      links.map((label) => [label, title]),
    ),
  );
  const homeLink = navigation.querySelector('a[href$="index.html"]');

  if (homeLink) {
    navigation.prepend(homeLink);
  }

  navigation.querySelectorAll("a").forEach((link) => {
    const destination = new URL(link.href);

    if (
      destination.origin === currentPage.origin &&
      destination.pathname === currentPage.pathname
    ) {
      link.setAttribute("aria-current", "page");
    }

    if (link === homeLink) {
      return;
    }

    const category = categoryByLink.get(link.textContent.trim());

    if (category) {
      linksByTitle.get(category).push(link);
    }
  });

  categories.forEach(({ title }) => {
    const links = linksByTitle.get(title);

    if (links.length === 0) {
      return;
    }

    const dropdown = document.createElement("details");
    const summary = document.createElement("summary");
    const submenu = document.createElement("div");

    dropdown.className = "navigation-dropdown";
    summary.textContent = title;
    submenu.className = "navigation-submenu";
    submenu.setAttribute("aria-label", `${title} bağlantıları`);

    if (title === "Akademik çalışmalar") {
      const siteRoot = new URL(homeLink.href);
      const degreeOptions = [
        {
          title: "Yüksek lisans",
          options: [
            ["PDF", "akademik/yuksek-lisans/master.pdf"],
            ["ODT", "akademik/yuksek-lisans/master.odt"],
            ["ODT Kaynağı", "html/yuksek-lisans-odt.html"],
          ],
        },
        {
          title: "Doktora",
          options: [
            ["PDF", "akademik/doktora/doktora.pdf"],
            ["ODT", "akademik/doktora/doktora.odt"],
            ["ODT Kaynağı", "html/doktora-odt.html"],
          ],
        },
      ];
      const groupedLinks = new Set();
      const primaryLinkGroups = new Map();
      const articleLink = links.find(
        (link) => link.textContent.trim() === "Özgür Yazılım, Özgür Türkiye",
      );

      if (articleLink) {
        const articlesDetails = document.createElement("details");
        const articlesLabel = document.createElement("summary");
        const articlesMenu = document.createElement("div");

        articlesDetails.className = "navigation-nested-dropdown";
        articlesLabel.textContent = "Makaleler";
        articlesMenu.className = "navigation-submenu navigation-submenu--side";
        articlesMenu.setAttribute("aria-label", "Makaleler");
        articlesMenu.append(articleLink);
        articlesDetails.append(articlesLabel, articlesMenu);
        primaryLinkGroups.set(articleLink, articlesDetails);
        groupedLinks.add(articleLink);
      }

      degreeOptions.forEach(({ title: degree, options }) => {
        const degreeLink = links.find(
          (link) => link.textContent.trim() === degree,
        );

        if (!degreeLink) {
          return;
        }

        const optionsDetails = document.createElement("details");
        const optionsLabel = document.createElement("summary");
        const optionsMenu = document.createElement("div");
        const linkGroup = document.createElement("div");

        optionsDetails.className = "navigation-nested-dropdown";
        optionsLabel.textContent = "Seçenekler";
        optionsMenu.className = "navigation-submenu navigation-submenu--side";
        optionsMenu.setAttribute("aria-label", `${degree} için diğer biçimler`);

        options.forEach(([label, path]) => {
          const option = document.createElement("a");
          option.href = new URL(path, siteRoot).href;
          option.textContent = label;
          optionsMenu.append(option);
        });

        optionsDetails.append(optionsLabel, optionsMenu);
        linkGroup.className = "navigation-link-group";
        linkGroup.append(degreeLink, optionsDetails);
        groupedLinks.add(degreeLink);
        primaryLinkGroups.set(degreeLink, linkGroup);
      });

      links.forEach((link) => {
        const linkGroup = primaryLinkGroups.get(link);

        if (linkGroup) {
          submenu.append(linkGroup);
        } else if (!groupedLinks.has(link)) {
          submenu.append(link);
        }
      });
    } else {
      links.forEach((link) => submenu.append(link));
    }

    dropdown.append(summary, submenu);
    navigation.append(dropdown);
  });

  navigation.querySelectorAll("details").forEach((menu) => {
    menu.addEventListener("mouseenter", () => {
      navigation.querySelectorAll("details[open]").forEach((openMenu) => {
        if (openMenu !== menu && !openMenu.contains(menu)) {
          openMenu.open = false;
        }
      });

      menu.open = true;
    });
  });

  navigation.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("a")) {
      return;
    }

    navigation.querySelectorAll("details[open]").forEach((menu) => {
      menu.open = false;
    });
  });

  navigation.addEventListener("mouseleave", () => {
    navigation.querySelectorAll("details[open]").forEach((menu) => {
      menu.open = false;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    const openMenus = [...navigation.querySelectorAll("details[open]")];

    if (openMenus.length === 0) {
      return;
    }

    event.preventDefault();

    const deepestOpenMenu = openMenus.reduce((deepest, menu) =>
      deepest && deepest.contains(menu) ? menu : deepest ?? menu,
    );

    deepestOpenMenu.open = false;
    deepestOpenMenu.querySelector(":scope > summary")?.focus();
  });
}
